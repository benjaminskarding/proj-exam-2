import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PlusIcon, ArrowLeft, CalendarIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchVenuesByProfile, deleteVenue } from "../../api/venues";
import { Venue } from "../../rulesets/types";
import VenueCard from "../../components/VenueCard";

export default function ManageVenues() {
  // auth and redirect if user isn't a venue manager
  const { name: profileName, token, venueManager } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!venueManager) navigate("/");
  }, [venueManager, navigate]);

  // state setup
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch user's venues + bookings
  useEffect(() => {
    if (!profileName) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchVenuesByProfile(profileName, {
          owner: true,
          token,
          bookings: true,
        });
        setVenues(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load venues");
      } finally {
        setLoading(false);
      }
    })();
  }, [profileName, token]);

  // delete venue from backend + local state
  async function handleDelete(id: string) {
    if (!window.confirm("Delete this venue permanently?")) return;
    try {
      await deleteVenue(id, token!);
      setVenues((prev) => prev.filter((v) => v.id !== id));
    } catch (err: any) {
      alert(err.message ?? "Could not delete venue");
    }
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-emerald-600 transition-colors hover:text-emerald-700 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Link>

      {/* header and create button */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">Manage Your Venues</h1>

        <Link
          to="/venues/create"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <PlusIcon className="h-5 w-5" />
          New Venue
        </Link>
      </div>

      {/* states */}
      {loading && (
        <p className="text-center text-slate-500">Loading your venues…</p>
      )}
      {error && (
        <p className="mb-6 text-center text-sm text-red-600">{error}</p>
      )}
      {!loading && venues.length === 0 && (
        <p className="text-center text-slate-500">
          You haven’t created any venues yet.
        </p>
      )}

      {/* venue cards grid */}
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {venues.map((v) => {
          return (
            <div
              key={v.id}
              className="group relative rounded-3xl border shadow transition  hover:shadow-lg"
            >
              <VenueCard venue={v} disableLink />

              {/* upcoming bookings */}
              {v.bookings && v.bookings.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-b-3xl border-t border-slate-200 bg-white">
                  <div className="flex items-center gap-2 border-b border-slate-200 bg-emerald-50 px-4 py-3">
                    <CalendarIcon className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-medium text-slate-800">
                      Upcoming Bookings
                    </h3>
                  </div>

                  {/* upcoming bookings list */}
                  <ul className="divide-y divide-slate-100 text-sm text-slate-700">
                    {v.bookings
                      .map((b: any) => ({
                        from: new Date(b.dateFrom),
                        to: new Date(b.dateTo),
                      }))
                      .filter((b) => b.to > new Date())
                      .sort((a, b) => a.from.getTime() - b.from.getTime())
                      .map((b, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50"
                        >
                          <div
                            className="flex-shrink-0 rounded-full"
                            style={{
                              width: "8px",
                              height: "8px",
                              backgroundColor: "#075F47",
                            }}
                          />
                          <span className="font-medium">
                            {b.from.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="mx-1.5 text-slate-400">→</span>
                          <span className="font-medium">
                            {b.to.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Hover overlay edit and delete buttons */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-48 items-center justify-center gap-4 rounded-t-3xl opacity-0 transition group-hover:opacity-100">
                <Link
                  to={`/venue/${v.id}`}
                  className="pointer-events-auto rounded-md bg-emerald-600 px-4 py-1 text-sm font-semibold text-white hover:bg-emerald-700 inline-flex items-center gap-1.5"
                >
                  Go to venue
                </Link>
                <Link
                  to={`/venues/edit/${v.id}`}
                  className="pointer-events-auto rounded-md bg-white px-4 py-1 text-sm font-semibold hover:bg-slate-100"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="pointer-events-auto rounded-md bg-red-600 px-4 py-1 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
