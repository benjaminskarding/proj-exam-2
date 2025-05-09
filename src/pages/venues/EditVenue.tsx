import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchVenueById, updateVenuePut, deleteVenue } from "../../api/venues";
import { NewVenue, VenueLocation, Venue } from "../../rulesets/types";
import { useAuth } from "../../contexts/AuthContext";

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

  useEffect(() => {
    if (!token || !venueManager) navigate("/login", { replace: true });
  }, [token, venueManager, navigate]);

  const [original, setOriginal] = useState<Venue | null>(null);
  const [form, setForm] = useState<NewVenue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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

  const updateField = <K extends keyof NewVenue>(key: K, value: NewVenue[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

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

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete this venue permanently?")) return;
    try {
      await deleteVenue(id, token!);
      navigate("/manage");
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!form)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading…
      </div>
    );

  const { location = emptyLoc } = form;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit venue</h1>
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
        <fieldset>
          <legend className="font-medium mb-2">Amenities</legend>
          {(["wifi", "parking", "breakfast", "pets"] as const).map((k) => (
            <label key={k} className="inline-flex items-center mr-6">
              <input
                type="checkbox"
                checked={!!form.meta[k]}
                onChange={() =>
                  updateField("meta", { ...form.meta, [k]: !form.meta[k] })
                }
                className="mr-1.5"
              />
              {k}
            </label>
          ))}
        </fieldset>
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
        <div>
          <label className="block mb-1 font-medium">
            Media URLs (comma-separated)
          </label>
          <input
            value={form.media.map((m) => m.url).join(", ")}
            onChange={(e) =>
              updateField(
                "media",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((url) => ({ url }))
              )
            }
            className="w-full border rounded-md p-2"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {done && <p className="text-emerald-600 text-sm">Saved!</p>}
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
