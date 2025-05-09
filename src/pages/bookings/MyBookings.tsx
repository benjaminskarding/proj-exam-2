import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Star } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchMyBookings, Booking } from "../../api/bookings";

function MyBookings() {
  const { name, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name || !token) return;
    (async () => {
      try {
        const data = await fetchMyBookings(name, token);

        data.sort(
          (a, b) =>
            new Date(a.dateFrom).valueOf() - new Date(b.dateFrom).valueOf()
        );
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [name, token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="mb-8 inline-flex items-center text-emerald-600">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to listings
      </Link>

      <h1 className="mb-8 text-3xl font-bold">My bookings</h1>

      {bookings.length === 0 ? (
        <p>You haven’t booked anything yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {bookings.map((b) => {
            const from = new Date(b.dateFrom);
            const to = new Date(b.dateTo);
            const nights =
              (to.valueOf() - from.valueOf()) / (1000 * 60 * 60 * 24);

            return (
              <Link
                key={b.id}
                to={`/venue/${b.venue.id}`}
                className="group rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={b.venue.media?.[0]?.url}
                    alt={b.venue.media?.[0]?.alt || b.venue.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-semibold line-clamp-1">{b.venue.name}</h3>

                  <p className="text-sm text-slate-500">
                    {from.toLocaleDateString()} &ndash;{" "}
                    {to.toLocaleDateString()}
                  </p>

                  <div className="flex items-center text-sm text-slate-600">
                    <Star className="mr-0.5 h-4 w-4 fill-amber-400 text-amber-400" />
                    {b.venue.rating?.toFixed(2) ?? "N/A"}
                  </div>

                  <span className="inline-block mt-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {nights} night{nights !== 1 && "s"} · {b.guests} guest
                    {b.guests !== 1 && "s"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
