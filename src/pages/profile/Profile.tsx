import { useState } from "react";
import { Camera, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { updateAvatarUrl } from "../../api/venues";

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

  // handles saving new avatar URL
  const saveAvatar = async () => {
    if (!avatarInput) return;
    setSavingAvatar(true);
    setAvatarError(null);
    try {
      const url = await updateAvatarUrl(profileName, avatarInput, token);
      setAvatarPreview(url);
      setAvatarInput("");
      // update auth context with new avatar
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
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 font-medium text-emerald-600 transition-colors hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>

        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="h-28 w-28 overflow-hidden rounded-full bg-slate-200 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={profileName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-14 w-14 text-slate-400" />
            )}
          </div>

          <h1 className="text-2xl font-bold">{profileName}</h1>

          <div className="flex w-full max-w-sm flex-col items-center gap-2 px-4">
            <label className="flex w-full gap-2">
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
                className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-white font-semibold disabled:bg-emerald-300"
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
    </div>
  );
}
