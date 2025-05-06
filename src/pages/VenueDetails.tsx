import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  PawPrint,
  ChevronLeft,
  Share,
  Heart,
} from "lucide-react";
import { fetchVenueById, fetchVenuesByProfile } from "../api/venues";
import { Venue } from "../rulesets/types";

function VenueDetails() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [hostVenues, setHostVenues] = useState<Venue[]>([]);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchVenueById(id);
        setVenue(data);
      } catch (err) {
        console.error("Could not load venue:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!venue?.owner?.name) return;

    const hostName = venue.owner.name;

    (async () => {
      try {
        const others = await fetchVenuesByProfile(hostName, { owner: true });
        setHostVenues(others.filter((v) => v.id !== venue.id));
      } catch (err) {
        console.error("Could not load host venues:", err);
      }
    })();
  }, [venue]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="mb-4 text-2xl font-bold">Venue not found</h2>
        <Link
          to="/"
          className="rounded-md bg-emerald-600 px-6 py-2 font-semibold text-white transition hover:bg-emerald-700"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center text-emerald-600">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to listings
        </Link>
      </div>

      <div className="container mx-auto flex items-start justify-between px-4">
        <h1 className="mb-4 text-3xl font-bold md:mb-6">{venue.name}</h1>
        <div className="hidden gap-4 md:flex">
          <button className="flex items-center gap-1 rounded-full p-2 hover:bg-slate-100">
            <Share className="h-5 w-5" />
            <span className="text-sm">Share</span>
          </button>
          <button className="flex items-center gap-1 rounded-full p-2 hover:bg-slate-100">
            <Heart className="h-5 w-5" />
            <span className="text-sm">Save</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto mb-8 grid grid-cols-1 gap-2 px-4 md:grid-cols-4">
        <div className="col-span-2 row-span-2 aspect-square md:aspect-auto">
          <img
            src={venue.media?.[0]?.url || "/placeholder.svg"}
            alt={venue.media?.[0]?.alt || venue.name}
            className="h-full w-full rounded-l-lg object-cover md:rounded-lg md:rounded-r-none"
          />
        </div>

        {venue.media?.slice(1, 5).map((m, i) => (
          <div key={i} className="relative hidden aspect-square md:block">
            <img
              src={m?.url || "/placeholder.svg"}
              alt={m?.alt || `${venue.name} image ${i + 2}`}
              className={`h-full w-full object-cover ${
                i === 3 ? "rounded-br-lg" : ""
              }`}
            />
            {i === 3 && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="absolute bottom-4 right-4 rounded-lg bg-white/80 px-4 py-2 text-sm backdrop-blur transition hover:bg-white"
              >
                Show all photos
              </button>
            )}
          </div>
        ))}
      </div>

      {/* main two‑column layout */}
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-3">
        {/* left column */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex flex-col gap-1 text-slate-600">
            <span className="flex items-center">
              <MapPin className="mr-1.5 h-4 w-4" />
              {venue.location?.city || "Unknown location"}
            </span>
            <span className="flex items-center">
              <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
              {venue.rating?.toFixed(2) || "N/A"}
              <span className="mx-1">·</span>
              <span className="underline">
                {venue.rating ? Math.round(venue.rating * 80) : 0} reviews
              </span>
            </span>
          </div>

          {/* stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 border-y py-6">
            <div>
              <p className="font-medium">{venue.maxGuests} guests</p>
              <p className="text-sm text-slate-500">Maximum occupancy</p>
            </div>
            <div>
              <p className="font-medium">3 bedrooms</p>
              <p className="text-sm text-slate-500">Comfy beds</p>
            </div>
          </div>

          {/* description */}
          <h2 className="mb-3 text-xl font-semibold">About this place</h2>
          <p className="mb-8 whitespace-pre-line text-slate-700">
            {venue.description}
          </p>

          <h2 className="mb-3 text-xl font-semibold">What this place offers</h2>
          <ul className="grid grid-cols-2 gap-y-2 text-slate-700">
            {venue.meta?.wifi && (
              <li className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Wifi
              </li>
            )}
            {venue.meta?.parking && (
              <li className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Free parking
              </li>
            )}
            {venue.meta?.breakfast && (
              <li className="flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Breakfast
              </li>
            )}
            {venue.meta?.pets && (
              <li className="flex items-center gap-2">
                <PawPrint className="h-4 w-4" />
                Pets allowed
              </li>
            )}
          </ul>
        </div>

        {/* right column — booking card */}
        <aside className="sticky top-8 h-max rounded-xl border bg-white p-6 shadow md:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-2xl font-bold">
              ${venue.price}
              <span className="text-base font-normal text-slate-500">
                {" "}
                night
              </span>
            </span>
            <span className="flex items-center text-sm">
              <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
              {venue.rating?.toFixed(2) || "N/A"}
            </span>
          </div>

          {/* placeholder booking form */}
          <div className="mb-4 space-y-3 rounded-lg border">
            <input type="date" className="w-full border-b p-3 outline-none" />
            <input type="date" className="w-full border-b p-3 outline-none" />
            <input
              type="number"
              min={1}
              max={venue.maxGuests}
              defaultValue={1}
              className="w-full p-3 outline-none"
              placeholder="Guests"
            />
          </div>

          <button className="mb-2 w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700">
            Reserve
          </button>
          <p className="text-center text-xs text-slate-500">
            You won’t be charged yet
          </p>
        </aside>
      </div>

      {/* host's other venues */}
      {hostVenues.length > 0 && (
        <section className="container mx-auto mt-16 px-4">
          <h2 className="mb-6 text-2xl font-bold">
            More places by {venue.owner?.name}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {hostVenues.map((v) => (
              <Link
                key={v.id}
                to={`/venues/${v.id}`}
                className="group rounded-xl bg-white shadow hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-t-xl">
                  <img
                    src={v.media?.[0]?.url || "/placeholder.svg"}
                    alt={v.media?.[0]?.alt || v.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{v.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-slate-600">
                    <Star className="mr-0.5 h-4 w-4 fill-amber-400 text-amber-400" />
                    {v.rating?.toFixed(2) ?? "N/A"}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    ${v.price} night
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAllPhotos && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-white">
          <div className="container mx-auto px-4 py-6">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="mb-4 flex items-center text-emerald-600"
            >
              <ChevronLeft className="mr-1 h-5 w-5" />
              Back
            </button>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {venue.media?.map((m, i) => (
                <img
                  key={i}
                  src={m?.url || "/placeholder.svg"}
                  alt={m?.alt || `Photo ${i + 1}`}
                  className="aspect-video w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenueDetails;
