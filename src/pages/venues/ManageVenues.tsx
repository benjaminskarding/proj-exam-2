import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchVenuesByProfile, deleteVenue } from "../../api/venues";
import { Venue } from "../../rulesets/types";
import VenueCard from "../../components/VenueCard";
import { PlusIcon } from "lucide-react";

export default function ManageVenues() {
  const { name: profileName, token, venueManager } = useAuth();
  const navigate = useNavigate();

  /* auth */
  useEffect(() => {
    if (!venueManager) navigate("/");
  }, [venueManager, navigate]);

  /* data  */
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileName) return;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchVenuesByProfile(profileName, {
          owner: true,
          token,
        });
        setVenues(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load venues");
      } finally {
        setLoading(false);
      }
    })();
  }, [profileName, token]);

  /*  actions */
  async function handleDelete(id: string) {
    if (!window.confirm("Delete this venue permanently?")) return;
    try {
      await deleteVenue(id, token!);
      setVenues((prev) => prev.filter((v) => v.id !== id));
    } catch (err: any) {
      alert(err.message ?? "Could not delete venue");
    }
  }

  /* ui */
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="mb-8 flex flex-col items-center justify-between">
        <h1 className="text-3xl font-bold mb-8">Manage your venues</h1>
        <Link
          to="/venues/create"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
        >
          <PlusIcon className="h-5 w-5" />
          New venue
        </Link>
      </div>

      {loading && (
        <p className="text-center text-slate-500">Loading your venues…</p>
      )}
      {error && (
        <p className="text-center text-red-600 text-sm mb-6">{error}</p>
      )}
      {!loading && venues.length === 0 && (
        <p className="text-center text-slate-500">
          You haven’t created any venues yet.
        </p>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {venues.map((v) => (
          <div key={v.id} className="relative group">
            {/* ⬇ disable all navigation on this card */}
            <VenueCard venue={v} disableLink />

            {/* overlay for EDIT / DELETE */}
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 pointer-events-none transition flex items-center justify-center gap-4">
              <Link
                to={`/venues/edit/${v.id}`}
                className="bg-white rounded-md px-4 py-1 text-sm font-semibold hover:bg-slate-100 pointer-events-auto"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(v.id)}
                className="bg-red-600 text-white rounded-md px-4 py-1 text-sm font-semibold hover:bg-red-700 pointer-events-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
