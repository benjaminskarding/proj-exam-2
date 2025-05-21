import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { loginUser } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // basic validation — has to be a Noroff email and a password with 8+ chars
  const validEmail = /@((stud\.)?noroff\.no)$/i.test(email);
  const canSubmit = validEmail && password.length >= 8;

  // handles form submission + login + redirect
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    try {
      const res = await loginUser({ email, password });

      auth.login({
        role: res.venueManager ? "manager" : "customer",
        name: res.name,
        avatarUrl: res.avatar?.url,
        token: res.accessToken,
        venueManager: !!res.venueManager,
      });

      nav("/");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold">Log in</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4" />
              Noroff e-mail
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="name@stud.noroff.no"
            />
          </label>

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
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
