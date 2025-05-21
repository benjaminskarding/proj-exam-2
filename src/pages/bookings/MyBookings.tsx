import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchMyBookings, Booking } from "../../api/bookings";
import VenueCard from "../../components/VenueCard";

export default function MyBookings() {
  const { name, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  /* grab all bookings for the current user and sort them by start date */
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

  // show a basic spinner while waiting
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 font-medium text-emerald-600 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Link>

      <h1 className="mb-8 text-3xl font-bold">My Bookings</h1>

      {bookings.length === 0 ? (
        <p>You haven’t booked anything yet.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {bookings.map((b) => {
            const from = new Date(b.dateFrom);
            const to = new Date(b.dateTo);

            return (
              <Link
                key={b.id}
                to={`/venue/${b.venue.id}`}
                className="group relative rounded-3xl border shadow transition hover:shadow-lg"
              >
                <VenueCard venue={b.venue} disableLink />

                <div className="mt-6 overflow-hidden rounded-b-3xl border-t border-slate-200 bg-white">
                  <div className="flex items-center gap-2 border-b border-slate-200 bg-emerald-50 px-4 py-3">
                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-medium text-slate-800">
                      My Booked Dates
                    </h3>
                  </div>
                  <ul className="divide-y divide-slate-100 text-sm text-slate-700">
                    <li className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                      <div
                        className="flex-shrink-0 rounded-full"
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#075F47",
                        }}
                      />
                      <span className="font-medium">
                        {from.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="mx-1.5 text-slate-400">→</span>
                      <span className="font-medium">
                        {to.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </li>
                  </ul>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
