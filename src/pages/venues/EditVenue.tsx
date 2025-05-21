// lets managers update an existing venue (if they own it)
// if not, user gets booted

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchVenueById, updateVenuePut, deleteVenue } from "../../api/venues";
import { NewVenue, VenueLocation, Venue } from "../../rulesets/types";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// fallback object in case location is missing
const emptyLoc: VenueLocation = {
  address: "",
  city: "",
  zip: "",
  country: "",
  continent: "",
};

export default function EditVenue() {
  const { id } = useParams<{ id: string }>();
  const { name: profileName, token, venueManager } = useAuth();
  const navigate = useNavigate();

  // redirect if not logged in or not a manager
  useEffect(() => {
    if (!token || !venueManager) navigate("/login", { replace: true });
  }, [token, venueManager, navigate]);

  const [original, setOriginal] = useState<Venue | null>(null);
  const [form, setForm] = useState<NewVenue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // fetch venue and check ownership
  useEffect(() => {
    if (!id) return;
    (async () => {
      const v = await fetchVenueById(id, { owner: true });
      if (v.owner?.name !== profileName && !venueManager) return navigate("/");
      setOriginal(v);
      setForm({
        name: v.name,
        description: v.description ?? "",
        price: v.price,
        maxGuests: v.maxGuests,
        media: v.media ?? [],
        meta: {
          wifi: false,
          parking: false,
          breakfast: false,
          pets: false,
          ...v.meta,
        },
        location: { ...emptyLoc, ...v.location },
      });
    })().catch((e) => setError(e.message));
  }, [id, profileName, venueManager, navigate]);

  // update a top-level field
  const updateField = <K extends keyof NewVenue>(key: K, value: NewVenue[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  // compare edited form to original to avoid redundant saves
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !form || !original) return;
    setSaving(true);
    setError(null);
    const diff: Partial<NewVenue> = {};
    (Object.keys(form) as (keyof NewVenue)[]).forEach((k) => {
      if (
        JSON.stringify((form as any)[k]) !==
        JSON.stringify((original as any)[k])
      ) {
        (diff as any)[k] = (form as any)[k];
      }
    });
    // if nothing changed
    if (Object.keys(diff).length === 0) {
      setDone(true);
      setSaving(false);
      return;
    }
    try {
      await updateVenuePut(id, diff, token!);
      setDone(true);
      setTimeout(() => navigate("/manage"), 1000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // delete venue if confirmed
  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this venue permanently?")) return;
    try {
      await deleteVenue(id, token!);
      navigate("/manage");
    } catch (e: any) {
      alert(e.message);
    }
  };

  // early return if data hasn’t loaded yet
  if (!form)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading…
      </div>
    );

  const { location = emptyLoc } = form;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 font-medium text-emerald-600 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Listings
      </Link>

      <h1 className="text-3xl font-bold mb-6">Edit Venue</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Price $/night *</label>
            <input
              type="number"
              min={0}
              required
              value={form.price}
              onChange={(e) => updateField("price", +e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Max guests *</label>
            <input
              type="number"
              min={1}
              required
              value={form.maxGuests}
              onChange={(e) => updateField("maxGuests", +e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>

        <fieldset className="border rounded-md p-4">
          <legend className="text-sm font-semibold px-2">Amenities</legend>
          {(["wifi", "parking", "breakfast", "pets"] as const).map((k) => (
            <label
              key={k}
              className="inline-flex items-center mr-6 mt-2 capitalize"
            >
              <input
                type="checkbox"
                checked={!!form.meta[k]}
                onChange={() =>
                  updateField("meta", { ...form.meta, [k]: !form.meta[k] })
                }
                className="mr-2"
              />
              {k}
            </label>
          ))}
        </fieldset>
        {/* location (in a collapsable) */}
        <details className="border rounded-md p-4">
          <summary className="cursor-pointer select-none font-medium">
            Location (optional)
          </summary>
          <div className="mt-4 space-y-4">
            {(
              [
                ["address", "Address"],
                ["city", "City"],
                ["zip", "ZIP"],
                ["country", "Country"],
                ["continent", "Continent"],
              ] as const
            ).map(([field, label]) => (
              <input
                key={field}
                placeholder={label}
                value={(location as any)[field] ?? ""}
                onChange={(e) =>
                  updateField("location", {
                    ...location,
                    [field]: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2"
              />
            ))}
          </div>
        </details>

        {/* media field */}
        <div>
          <label className="block mb-2 font-medium">Media URLs</label>
          <div className="space-y-2">
            {form.media.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="url"
                  placeholder={`Image URL ${i + 1}`}
                  value={m.url}
                  onChange={(e) => {
                    const updated = [...form.media];
                    updated[i] = {
                      ...updated[i],
                      url: e.target.value,
                      alt:
                        updated[i].alt || form.name || `Venue image ${i + 1}`,
                    };
                    updateField("media", updated);
                  }}
                  className="flex-1 border rounded-md p-2"
                />
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.media.filter((_, idx) => idx !== i);
                      updateField("media", updated);
                    }}
                    className="text-red-600 text-sm px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.media.length < 5 && (
            <button
              type="button"
              onClick={() =>
                updateField("media", [
                  ...form.media,
                  {
                    url: "",
                    alt: form.name || `Venue image ${form.media.length + 1}`,
                  },
                ])
              }
              className="mt-2 rounded border px-4 py-1 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
            >
              + Add More Images
            </button>
          )}
        </div>

        {/* errors + status */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {done && <p className="text-emerald-600 text-sm">Saved!</p>}

        {/* delete + save buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
          <button
            disabled={saving}
            className="px-6 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
