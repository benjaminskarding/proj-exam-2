// src/pages/ManageVenues.tsx
import { useState, useEffect } from "react";
import { Plus, Camera, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchVenuesByProfile,
  createVenuePost,
  updateAvatarUrl,
} from "../api/venues";
import { Venue, NewVenue, VenueMeta } from "../rulesets/types";

function Profile() {
  const {
    name: profileName,
    token,
    venueManager,
    avatarUrl,
    login,
  } = useAuth();

  const [avatarInput, setAvatarInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    avatarUrl ?? null
  );
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<NewVenue>({
    name: "",
    description: "",
    price: 0,
    maxGuests: 1,
    media: [],
    meta: {},
    location: {
      address: "",
      city: "",
      zip: "",
      country: "",
      continent: "",
      lat: 0,
      lng: 0,
    },
  });

  useEffect(() => {
    if (!token || !venueManager) return;
    (async () => {
      const data = await fetchVenuesByProfile(profileName, {
        owner: true,
        token,
      });
      setVenues(data);
    })().catch(console.error);
  }, [profileName, token, venueManager]);

  async function saveAvatar() {
    if (!avatarInput) return;
    setSavingAvatar(true);
    setAvatarError(null);
    try {
      const url = await updateAvatarUrl(profileName, avatarInput, token);
      setAvatarPreview(url);
      setAvatarInput("");
      /* refresh global context so rest of app has new avatar */
      login({
        role: venueManager ? "manager" : "customer",
        name: profileName,
        avatarUrl: url,
        token,
        venueManager,
      });
    } catch (err: any) {
      setAvatarError(err.message ?? "Failed to update avatar");
    } finally {
      setSavingAvatar(false);
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: name === "price" || name === "maxGuests" ? Number(value) : value,
    }));
  };
  const handleMetaChange = (k: keyof VenueMeta) =>
    setFormData((p) => ({
      ...p,
      meta: { ...p.meta, [k]: !p.meta?.[k] },
    }));
  async function handleCreateVenue(e: React.FormEvent) {
    e.preventDefault();
    const newVenue = await createVenuePost(formData, token!);
    setVenues((v) => [...v, newVenue]);
    setIsCreateModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <header className="flex flex-col items-center gap-4 mb-10">
        <div className="w-28 h-28 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={profileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-14 w-14 text-slate-400" />
          )}
        </div>
        <h1 className="text-2xl font-bold">{profileName}</h1>

        <div className="flex flex-col items-center gap-2 w-full max-w-sm">
          <label className="w-full flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              className="flex-1 rounded border px-3 py-2 text-sm"
            />
            <button
              onClick={saveAvatar}
              disabled={!avatarInput || savingAvatar}
              className="px-3 py-2 bg-emerald-600 text-white rounded disabled:bg-emerald-300 flex items-center gap-1"
            >
              <Camera className="h-4 w-4" />
              {savingAvatar ? "Saving…" : "Save"}
            </button>
          </label>
          {avatarError && (
            <span className="text-xs text-red-600">{avatarError}</span>
          )}
          <span className="text-xs text-slate-500">
            Paste a public image URL, then click Save.
          </span>
        </div>
      </header>

      <div className="container mx-auto px-4">
        {venueManager && (
          <>
            <div className="flex flex-col justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold my-12">Manage Your Venues</h2>
                <p className="mt-12 text-slate-600">
                  Create, edit, and manage your properties
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 md:mt-12 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create New Venue
              </button>
            </div>

            {venues.length === 0 ? (
              <p className="text-center py-12">
                You haven't created any venues yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md"
                  >
                    <img
                      src={v.media?.[0]?.url || "/placeholder.svg"}
                      alt={v.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-1">{v.name}</h3>
                      <p className="text-sm text-slate-600 mb-1">
                        {v.location?.city || "Unknown location"}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        {v.description}
                      </p>
                      <p className="text-sm font-medium">${v.price} / night</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {isCreateModalOpen && venueManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Venue</h2>
            <form onSubmit={handleCreateVenue} className="space-y-4">
              <input
                name="name"
                placeholder="Venue name"
                required
                className="w-full rounded border px-3 py-2"
                onChange={handleInputChange}
              />
              <textarea
                name="description"
                placeholder="Description"
                required
                className="w-full rounded border px-3 py-2"
                onChange={handleInputChange}
              />
              <input
                name="price"
                type="number"
                placeholder="Price"
                required
                className="w-full rounded border px-3 py-2"
                onChange={handleInputChange}
              />
              <input
                name="maxGuests"
                type="number"
                placeholder="Max guests"
                required
                className="w-full rounded border px-3 py-2"
                onChange={handleInputChange}
              />
              <input
                name="media"
                placeholder="Image URL"
                className="w-full rounded border px-3 py-2"
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    media: [{ url: e.target.value }],
                  }))
                }
              />

              <label className="block text-sm font-medium">Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {(["wifi", "parking", "breakfast", "pets"] as const).map(
                  (key) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!formData.meta?.[key]}
                        onChange={() => handleMetaChange(key)}
                      />
                      {key}
                    </label>
                  )
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
