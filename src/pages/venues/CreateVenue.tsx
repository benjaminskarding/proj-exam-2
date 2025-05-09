import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { createVenuePost } from "../../api/venues";
import type { NewVenue, VenueLocation } from "../../rulesets/types";

const emptyLoc: VenueLocation = {
  address: "",
  city: "",
  zip: "",
  country: "",
  continent: "",
};

export default function CreateVenue() {
  const { token, venueManager } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!venueManager) navigate("/", { replace: true });
  }, [venueManager, navigate]);

  const [form, setForm] = useState<NewVenue>({
    name: "",
    description: "",
    price: 0,
    maxGuests: 1,
    media: [],
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: emptyLoc,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof NewVenue>(key: K, value: NewVenue[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleMeta = (key: keyof NewVenue["meta"]) =>
    setForm((prev) => ({
      ...prev,
      meta: { ...prev.meta, [key]: !prev.meta[key] },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await createVenuePost(form, token!);
      navigate(`/venue/${created.id}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create venue");
    } finally {
      setSaving(false);
    }
  };

  const { location = emptyLoc } = form;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Create a new venue</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
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
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Price $/night *</label>
            <input
              type="number"
              min={1}
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
        <fieldset className="space-y-4">
          <legend className="font-semibold">Location (optional)</legend>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Address"
              value={location.address}
              onChange={(e) =>
                updateField("location", {
                  ...location,
                  address: e.target.value,
                })
              }
              className="border rounded-md p-2 col-span-2"
            />
            <input
              placeholder="City"
              value={location.city}
              onChange={(e) =>
                updateField("location", { ...location, city: e.target.value })
              }
              className="border rounded-md p-2"
            />
            <input
              placeholder="ZIP"
              value={location.zip}
              onChange={(e) =>
                updateField("location", { ...location, zip: e.target.value })
              }
              className="border rounded-md p-2"
            />
            <input
              placeholder="Country"
              value={location.country}
              onChange={(e) =>
                updateField("location", {
                  ...location,
                  country: e.target.value,
                })
              }
              className="border rounded-md p-2"
            />
            <input
              placeholder="Continent"
              value={location.continent}
              onChange={(e) =>
                updateField("location", {
                  ...location,
                  continent: e.target.value,
                })
              }
              className="border rounded-md p-2"
            />
          </div>
        </fieldset>
        <fieldset className="border rounded-md p-4">
          <legend className="text-sm font-semibold px-2">Amenities</legend>
          {(Object.keys(form.meta) as (keyof NewVenue["meta"])[]).map((k) => (
            <label
              key={k}
              className="inline-flex items-center mr-6 mt-2 capitalize"
            >
              <input
                type="checkbox"
                checked={form.meta[k]}
                onChange={() => toggleMeta(k)}
                className="mr-2"
              />
              {k}
            </label>
          ))}
        </fieldset>
        <div>
          <label className="block mb-1 font-medium">
            Media URLs (comma-separated)
          </label>
          <input
            value={form.media.map((m) => m.url).join(",")}
            onChange={(e) =>
              updateField(
                "media",
                e.target.value
                  .split(",")
                  .map((u) => u.trim())
                  .filter(Boolean)
                  .map((url) => ({ url, alt: form.name || "venue photo" }))
              )
            }
            className="w-full border rounded-md p-2"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 rounded-md font-semibold"
        >
          {saving ? "Creating…" : "Create venue"}
        </button>
      </form>
    </div>
  );
}
