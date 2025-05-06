// api/auth.ts
import { API_BASE } from "./config";

/* ---------- helpers ---------- */
function isNoroffMail(mail: string) {
  return /^[^@]+@stud\.noroff\.no$/i.test(mail);
}

/* ---------- REGISTER ---------- */
export type RegisterOptions = {
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  avatarAlt?: string;
  bannerUrl?: string;
  bannerAlt?: string;
  venueManager?: boolean;
};

export async function registerUser(opts: RegisterOptions) {
  /* local sanity‑checks so we fail fast */
  if (!isNoroffMail(opts.email)) {
    throw new Error("E‑mail must be a stud.noroff.no address");
  }
  if (opts.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const body = {
    name: opts.name,
    email: opts.email,
    password: opts.password,
    bio: opts.bio,
    avatar: opts.avatarUrl
      ? { url: opts.avatarUrl, alt: opts.avatarAlt ?? "" }
      : undefined,
    banner: opts.bannerUrl
      ? { url: opts.bannerUrl, alt: opts.bannerAlt ?? "" }
      : undefined,
    venueManager: opts.venueManager ?? false,
  };

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const { errors } = await res.json().catch(() => ({}));
    throw new Error(errors?.[0]?.message || "Registration failed");
  }

  const { data } = await res.json();
  return data; // newly created profile
}

/* ---------- LOGIN ---------- */
export type LoginOptions = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  name: string;
  venueManager: boolean;
  avatar?: { url: string };
};

export async function loginUser(opts: LoginOptions): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login?_holidaze=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: opts.email, password: opts.password }),
  });

  if (!res.ok) {
    const { errors } = await res.json().catch(() => ({}));
    throw new Error(errors?.[0]?.message || "Login failed");
  }

  const { data } = await res.json();
  return data as LoginResponse;
}
