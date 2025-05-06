import { API_BASE, API_KEY } from "./config";
import { Venue, NewVenue } from "../rulesets/types";

// Fetch

export async function fetchVenues(): Promise<Venue[]> {
  const response = await fetch(`${API_BASE}/holidaze/venues`);
  if (!response.ok) throw new Error("Failed to fetch venues");

  const { data } = await response.json();
  return data;
}

export async function fetchVenueById(
  id: string,
  opts: { owner?: boolean; bookings?: boolean } = { owner: true }
) {
  const params = new URLSearchParams();
  if (opts.owner) params.append("_owner", "true");
  if (opts.bookings) params.append("_bookings", "true");

  const res = await fetch(`${API_BASE}/holidaze/venues/${id}?${params}`);
  if (!res.ok) throw new Error("failed to fetch venue");

  const { data } = await res.json();
  return data as Venue;
}

export async function fetchVenuesByProfile(
  profileName: string,
  opts: { owner?: boolean; token?: string } = {}
) {
  const params = opts.owner ? "?_owner=true" : "";
  const headers: HeadersInit = {};

  if (opts.token) {
    headers["Authorization"] = `Bearer ${opts.token}`;
    headers["X-Noroff-API-Key"] = API_KEY;
  }

  const res = await fetch(
    `${API_BASE}/holidaze/profiles/${profileName}/venues${params}`,
    { headers }
  );

  if (!res.ok) throw new Error("failed profile‑venues");

  const { data } = await res.json();
  return data as Venue[];
}

// Create

export async function createVenuePost(
  body: NewVenue,
  token: string
): Promise<Venue> {
  const res = await fetch(`${API_BASE}/holidaze/venues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const { errors } = await res.json().catch(() => ({}));
    throw new Error(errors?.[0]?.message || "Could not create venue");
  }

  const { data } = await res.json();
  return data as Venue;
}

// Search

export async function searchVenues(query: string): Promise<Venue[]> {
  const res = await fetch(
    `${API_BASE}/holidaze/venues/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to search venues");
  const { data } = await res.json();
  return data;
}

// Avatar update

export async function updateAvatarUrl(
  profileName: string,
  avatarUrl: string,
  token: string
) {
  const res = await fetch(
    `${API_BASE}/holidaze/profiles/${encodeURIComponent(profileName)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Noroff-API-Key": API_KEY,
      },
      body: JSON.stringify({
        avatar: { url: avatarUrl, alt: profileName },
      }),
    }
  );

  if (!res.ok) {
    const { errors } = await res.json().catch(() => ({}));
    throw new Error(errors?.[0]?.message ?? res.statusText);
  }

  return (await res.json()).data.avatar.url as string;
}
