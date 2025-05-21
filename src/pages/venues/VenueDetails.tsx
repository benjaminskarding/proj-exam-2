import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import {
  MapPin,
  StarIcon,
  Wifi,
  Car,
  Coffee,
  PawPrint,
  ChevronLeft,
  ArrowLeft,
  Globe,
  Home,
} from "lucide-react";
import { fetchVenueById, fetchVenuesByProfile } from "../../api/venues";
import {
  RawBooking,
  createBooking,
  fetchBookingsForVenue,
} from "../../api/bookings";
import { useAuth } from "../../contexts/AuthContext";
import { Venue } from "../../rulesets/types";
import { eachDayOfInterval } from "date-fns";

export default function VenueDetails() {
  const { id } = useParams<{ id: string }>();
  const { name: profileName, token } = useAuth();

  // main data state
  const [venue, setVenue] = useState<Venue | null>(null);
  const [hostVenues, setHostVenues] = useState<Venue[]>([]);
  const [bookedRanges, setBookedRanges] = useState<{ from: Date; to: Date }[]>(
    []
  );
  const [myRanges, setMyRanges] = useState<{ from: Date; to: Date }[]>([]);
  const [loading, setLoading] = useState(true);

  // booking UI state
  const today = new Date();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // image slider tracking (mobile)
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    setActiveSlide(Math.round(el.scrollLeft / el.offsetWidth));
  }

  // load venue details + bookings
  useEffect(() => {
    if (!id || !token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [vData, bookings] = await Promise.all([
          fetchVenueById(id),
          fetchBookingsForVenue(id, token),
        ]);
        if (cancelled) return;
        setVenue(vData);

        const all: { from: Date; to: Date }[] = [];
        const mine: { from: Date; to: Date }[] = [];
        bookings.forEach((b: RawBooking) => {
          const r = { from: new Date(b.dateFrom), to: new Date(b.dateTo) };
          all.push(r);
          if (b.customer?.name === profileName) mine.push(r);
        });
        setBookedRanges(all);
        setMyRanges(mine);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, profileName, token]);

  // fetch more venues by same host
  useEffect(() => {
    if (!venue?.owner?.name || !token) return;
    const ownerName = venue.owner.name;

    (async () => {
      try {
        const others = await fetchVenuesByProfile(ownerName, {
          owner: true,
          token,
        });
        setHostVenues(others.filter((v) => v.id !== venue.id));
      } catch {}
    })();
  }, [venue, token]);

  // date utils for disabling + highlighting
  const isDayBooked = (d: Date) =>
    bookedRanges.some((r) => d >= r.from && d <= r.to);
  const bookedDays = bookedRanges.flatMap((r) =>
    eachDayOfInterval({ start: r.from, end: r.to })
  );
  const myDays = myRanges.flatMap((r) =>
    eachDayOfInterval({ start: r.from, end: r.to })
  );

  // submit booking
  async function handleReserve(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !checkIn || !checkOut || !token) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await createBooking({
        venueId: id,
        dateFrom: checkIn.toISOString(),
        dateTo: checkOut.toISOString(),
        guests,
      });

      const optimistic = { from: checkIn, to: checkOut };
      setBookedRanges((p) => [...p, optimistic]);
      setMyRanges((p) => [...p, optimistic]);
      setSuccess(true);
      setCheckIn(null);
      setCheckOut(null);
      setGuests(1);

      // refresh booking data
      fetchBookingsForVenue(id, token).then((fresh) => {
        const all: { from: Date; to: Date }[] = [];
        const mine: { from: Date; to: Date }[] = [];
        fresh.forEach((b: RawBooking) => {
          const r = { from: new Date(b.dateFrom), to: new Date(b.dateTo) };
          all.push(r);
          if (b.customer?.name === profileName) mine.push(r);
        });
        setBookedRanges(all);
        setMyRanges(mine);
      });
    } catch (err: any) {
      setError(err.message ?? "Booking failed");
    } finally {
      setSaving(false);
    }
  }

  // loading + fallback states
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-emerald-600" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="mb-4 text-2xl font-bold">Venue not found</h2>
        <Link to="/" className="bg-emerald-600 text-white px-6 py-2 rounded-md">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 pt-10 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
      </div>

      <div className="container mx-auto flex items-start justify-between px-4">
        <h1 className="text-3xl font-bold truncate">{venue.name}</h1>
      </div>

      <div className="md:hidden mb-8 overflow-hidden">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar w-screen"
        >
          {venue.media?.map((m, i) => (
            <img
              key={i}
              src={m.url}
              alt={m.alt || `${venue.name} photo ${i + 1}`}
              className="w-screen flex-shrink-0 snap-center aspect-[4/3] object-cover"
            />
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {venue.media?.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i === activeSlide ? "bg-emerald-600 scale-110" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto mb-8 px-4 hidden md:grid grid-cols-4 gap-2">
        <div className="col-span-2 row-span-2 aspect-square">
          <img
            src={venue.media?.[0]?.url}
            alt={venue.media?.[0]?.alt || venue.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        {venue.media?.slice(1, 5).map((m, i) => (
          <div key={i} className="relative aspect-square">
            <img
              src={m.url}
              alt={m.alt || `${venue.name} photo ${i + 2}`}
              className="w-full h-full object-cover rounded-lg"
            />
            {i === 3 && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="absolute bottom-4 right-4 bg-white/80 px-4 py-2 rounded-lg text-sm"
              >
                Show all photos
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 lg:grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6 flex flex-col gap-1 text-slate-600">
            {venue.location?.city && venue.location?.country && (
              <span className="flex items-center capitalize">
                <MapPin className="mr-1.5 h-4 w-4" />
                {venue.location.city}, {venue.location.country}
              </span>
            )}

            {(venue.location?.address || venue.location?.zip) && (
              <span className="flex items-center capitalize">
                <Home className="mr-1.5 h-4 w-4" />
                {[venue.location?.address, venue.location?.zip]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            )}

            {venue.location?.continent && (
              <span className="flex items-center capitalize">
                <Globe className="mr-1.5 h-4 w-4" />
                {venue.location.continent}
              </span>
            )}

            <span className="flex items-center">
              <StarIcon className="mr-0.5 h-4 w-4 fill-amber-400 text-amber-400" />
              {venue.rating?.toFixed(2) ?? "N/A"} ·{" "}
              <span className="underline">
                {" "}
                &nbsp;
                {venue.rating ? Math.round(venue.rating * 80) : 0} reviews
              </span>
            </span>
          </div>

          <h2 className="text-xl font-semibold mb-3">About this place</h2>
          <p className="mb-8 whitespace-pre-line text-slate-700">
            {venue.description}
          </p>
          <p className="mb-8 whitespace-pre-line text-slate-700">
            Max guests: &nbsp;{venue.maxGuests}
          </p>

          <h2 className="text-xl font-semibold mb-3">What this place offers</h2>
          <ul className="grid grid-cols-2 gap-y-2 text-slate-700">
            {venue.meta?.wifi && (
              <li className="flex items-center gap-2">
                <Wifi className="h-4 w-4" /> Wifi
              </li>
            )}
            {venue.meta?.parking && (
              <li className="flex items-center gap-2">
                <Car className="h-4 w-4" /> Free parking
              </li>
            )}
            {venue.meta?.breakfast && (
              <li className="flex items-center gap-2">
                <Coffee className="h-4 w-4" /> Breakfast
              </li>
            )}
            {venue.meta?.pets && (
              <li className="flex items-center gap-2">
                <PawPrint className="h-4 w-4" /> Pets allowed
              </li>
            )}
          </ul>
        </div>

        <aside className="bg-white border rounded-2xl p-6 shadow-sm mt-8 md:mt-0 lg:sticky lg:top-8">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-3xl font-bold">
              ${venue.price}
              <span className="ml-1 text-base text-slate-500">/ night</span>
            </span>
            <span className="flex items-center text-sm">
              <StarIcon className="mr-0.5 h-4 w-4 fill-amber-400 text-amber-400" />
              {venue.rating?.toFixed(2) ?? "N/A"}
            </span>
          </div>

          <form onSubmit={handleReserve} className="space-y-4">
            <div className="border rounded-lg focus-within:ring-2 focus-within:ring-emerald-500">
              <label className="block px-4 pt-2 text-xs text-slate-500">
                Check-in
              </label>
              <DatePicker
                selected={checkIn}
                onChange={(d) => {
                  setCheckIn(d);
                  if (checkOut && d && d >= checkOut) setCheckOut(null);
                }}
                filterDate={(d) => !isDayBooked(d)}
                highlightDates={[
                  { "react-datepicker__day--mine": myDays },
                  { "react-datepicker__day--booked": bookedDays },
                ]}
                placeholderText="Select a date"
                className="w-full px-4 py-2 outline-none"
                minDate={today}
              />
              <hr className="bg-slate-200 h-px" />
              <label className="block px-4 pt-2 text-xs text-slate-500">
                Check-out
              </label>
              <DatePicker
                selected={checkOut}
                onChange={(d) => setCheckOut(d)}
                filterDate={(d) => !isDayBooked(d) && (!checkIn || d > checkIn)}
                highlightDates={[
                  { "react-datepicker__day--mine": myDays },
                  { "react-datepicker__day--booked": bookedDays },
                ]}
                placeholderText="Select a date"
                className="w-full px-4 py-2 outline-none"
                minDate={checkIn ?? today}
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="text-sm font-medium text-slate-700">Guests</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="h-8 w-8 rounded-full border disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center">{guests}</span>
                <button
                  type="button"
                  disabled={guests >= venue.maxGuests}
                  onClick={() => setGuests((g) => g + 1)}
                  className="h-8 w-8 rounded-full border"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 font-semibold"
            >
              {saving ? "Reserving…" : "Reserve"}
            </button>

            {error && (
              <p className="text-red-600 text-xs text-center">{error}</p>
            )}
            {success && (
              <p className="text-emerald-600 text-xs text-center">
                Booking confirmed!
              </p>
            )}
            <p className="text-slate-500 text-xs text-center">
              You won’t be charged yet
            </p>
          </form>
        </aside>
      </div>

      {hostVenues.length > 0 && (
        <section className="container mx-auto px-4 mt-16">
          <h2 className="text-2xl font-bold mb-6">
            More places by {venue.owner?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hostVenues.map((v) => (
              <Link
                key={v.id}
                to={`/venue/${v.id}`}
                className="group bg-white rounded-xl shadow hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-t-xl">
                  <img
                    src={v.media?.[0]?.url || "/placeholder.svg"}
                    alt={v.media?.[0]?.alt || v.name}
                    className="w-full h-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{v.name}</h3>
                  <div className="flex items-center text-sm text-slate-600 mt-1">
                    <StarIcon className="mr-0.5 h-4 w-4 fill-amber-400 text-amber-400" />
                    {v.rating?.toFixed(2) ?? "N/A"}
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    ${v.price} night
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAllPhotos && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="inline-flex items-center text-emerald-600 mb-4"
            >
              <ChevronLeft className="mr-1 h-5 w-5" /> Back
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venue.media?.map((m, i) => (
                <img
                  key={i}
                  src={m.url}
                  alt={m.alt || `Photo ${i + 1}`}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
