import { getJSON, postJSON, putJSON, deleteJSON } from "./utils";
import { Venue, NewVenue } from "../rulesets/types";

// grab everything — unfiltered, unpaginated
export const fetchVenues = () => getJSON<Venue[]>("/holidaze/venues");

// fetch one venue by id — can include owner or bookings if needed
export function fetchVenueById(
  id: string,
  opts: { owner?: boolean; bookings?: boolean } = {}
) {
  const params: Record<string, any> = {};
  if (opts.owner) params._owner = true;
  if (opts.bookings) params._bookings = true;
  return getJSON<Venue>(`/holidaze/venues/${id}`, params);
}

// fetch all venues for a specific user — optional includes + auth
export function fetchVenuesByProfile(
  profileName: string,
  opts: { owner?: boolean; bookings?: boolean; token?: string } = {}
) {
  const params: Record<string, any> = {};
  if (opts.owner) params._owner = true;
  if (opts.bookings) params._bookings = true;
  return getJSON<Venue[]>(
    `/holidaze/profiles/${encodeURIComponent(profileName)}/venues`,
    params,
    opts.token
  );
}

// post a new venue — expects auth token
export function createVenuePost(body: NewVenue, token: string) {
  return postJSON<Venue>("/holidaze/venues", body, undefined, token);
}

// update a venue
export function updateVenuePut(
  id: string,
  body: Partial<NewVenue>,
  token: string
) {
  return putJSON<Venue>(`/holidaze/venues/${id}`, body, undefined, token);
}

// deletes a venue by id
export function deleteVenue(id: string, token: string) {
  return deleteJSON(`/holidaze/venues/${id}`, undefined, token);
}

// used in search — strips diacritics and lowercases everything
function normalise(value?: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// search venues by query — server-side + local fallback
export async function searchVenues(query: string): Promise<Venue[]> {
  const q = query.trim();
  if (!q) return [];

  // server search first
  const server = await getJSON<Venue[]>("/holidaze/venues/search", { q });

  // local fallback if input is at least 2 chars
  let local: Venue[] = [];
  if (q.length >= 2) {
    const SAMPLE_LIMIT = 300;
    const sample = (await fetchVenues()).slice(0, SAMPLE_LIMIT);
    const needle = normalise(q);
    local = sample.filter((v) => {
      const loc = v.location ?? {};
      const hay =
        normalise(loc.city) + normalise(loc.country) + normalise(loc.continent);
      return hay.includes(needle);
    });
  }

  // merge results — remove unneccessary copies by ID
  const byId = new Map<string, Venue>();
  [...server, ...local].forEach((v) => byId.set(v.id, v));
  return Array.from(byId.values());
}

export function updateAvatarUrl(
  profileName: string,
  avatarUrl: string,
  token: string
) {
  return putJSON<{ url: string }>(
    `/holidaze/profiles/${encodeURIComponent(profileName)}`,
    { avatar: { url: avatarUrl, alt: profileName } },
    undefined,
    token
  ).then((a) => a.url);
}
