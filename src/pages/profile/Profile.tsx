import { useEffect, useState } from "react";
import { Camera, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchVenuesByProfile, updateAvatarUrl } from "../../api/venues";
import { Venue } from "../../rulesets/types";

export default function Profile() {
  const {
    name: profileName,
    token,
    venueManager,
    avatarUrl,
    login,
  } = useAuth();

  const [avatarInput, setAvatarInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl ?? "");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    if (!token || !venueManager) return;
    (async () => {
      try {
        const data = await fetchVenuesByProfile(profileName, {
          owner: true,
          token,
        });
        setVenues(data);
      } catch {}
    })();
  }, [profileName, token, venueManager]);

  const saveAvatar = async () => {
    if (!avatarInput) return;
    setSavingAvatar(true);
    setAvatarError(null);
    try {
      const url = await updateAvatarUrl(profileName, avatarInput, token);
      setAvatarPreview(url);
      setAvatarInput("");
      login({
        role: venueManager ? "manager" : "customer",
        name: profileName,
        avatarUrl: url,
        token,
        venueManager,
      });
    } catch (err: any) {
      setAvatarError(err.message);
    } finally {
      setSavingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="flex flex-col items-center gap-4 mb-10">
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
      </div>
    </div>
  );
}
