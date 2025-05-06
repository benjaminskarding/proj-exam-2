import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { Mail, User, ImageIcon, Lock } from "lucide-react";

export default function Register() {
  const nav = useNavigate();

  /* ── inputs ───────────────────────────────────── */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [avatarUrl, setAvatar] = useState("");
  const [venueManager, setVenueManager] = useState(false);

  /* ── ui state ─────────────────────────────────── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /** Noroff address must end with @stud.noroff.no OR @noroff.no */
  const validEmail = /@((stud\.)?noroff\.no)$/i.test(email);
  const canSubmit =
    name.trim().length >= 3 && password.length >= 8 && validEmail;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await registerUser({
        name,
        email,
        password,
        avatarUrl: avatarUrl || undefined,
        venueManager,
      });
      setSuccess(true);

      // clear fields
      setName("");
      setEmail("");
      setPass("");
      setAvatar("");

      // redirect after 2 s so banner is visible
      setTimeout(() => nav("/login"), 2000);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">Create account</h1>

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
            🎉 Account created! Redirecting to login…
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              Username
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="username"
            />
          </label>

          {/* Email */}
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Noroff e‑mail
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="name@stud.noroff.no"
            />
            {!validEmail && email && (
              <span className="mt-1 block text-xs text-red-600">
                Must be a Noroff address
              </span>
            )}
          </label>

          {/* Password */}
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4" />
              Password
            </span>
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="At least 8 characters"
            />
          </label>

          {/* Avatar URL */}
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="h-4 w-4" />
              Avatar URL
              <span className="ml-auto text-xs text-slate-400">(optional)</span>
            </span>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://…"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={venueManager}
              onChange={() => setVenueManager((prev) => !prev)}
            />
            I will be listing properties
          </label>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-emerald-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
