import { API_BASE } from "./config";

function isNoroffMail(mail: string): boolean {
  return /^[^@]+@stud\.noroff\.no$/i.test(mail);
}

async function safeFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json.errors?.[0]?.message ?? res.statusText;
    throw new Error(message);
  }
  return json.data as T;
}

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
  if (!isNoroffMail(opts.email))
    throw new Error("E-mail must be a stud.noroff.no address");
  if (opts.password.length < 8)
    throw new Error("Password must be at least 8 characters");

  const body: Record<string, any> = {
    name: opts.name,
    email: opts.email,
    password: opts.password,
    venueManager: opts.venueManager ?? false,
  };
  if (opts.bio) body.bio = opts.bio;
  if (opts.avatarUrl)
    body.avatar = { url: opts.avatarUrl, alt: opts.avatarAlt ?? "" };
  if (opts.bannerUrl)
    body.banner = { url: opts.bannerUrl, alt: opts.bannerAlt ?? "" };

  return safeFetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export type LoginOptions = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  name: string;
  venueManager: boolean;
  avatar?: { url: string };
};

export async function loginUser(opts: LoginOptions): Promise<LoginResponse> {
  return safeFetch(`${API_BASE}/auth/login?_holidaze=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
}
