import { safeJSON, authHeaders, buildUrl, fetchAllPages } from "./utils";
import { Venue } from "../rulesets/types";

export type RawBooking = {
  dateFrom: string;
  dateTo: string;
  customer?: { name: string };
};

export type Booking = {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  venue: Venue;
};

export async function createBooking(body: {
  venueId: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
}) {
  const token = JSON.parse(localStorage.getItem("auth")!)?.token;
  return safeJSON<any>(
    await fetch(buildUrl("/holidaze/bookings"), {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    })
  );
}

export function fetchMyBookings(profileName: string, token: string) {
  return fetchAllPages<Booking>(
    `/holidaze/profiles/${encodeURIComponent(profileName)}/bookings`,
    (data) => data as Booking[],
    authHeaders(token),
    { _venue: true }
  );
}

export function fetchBookingsForVenue(
  venueId: string,
  token: string
): Promise<RawBooking[]> {
  return fetchAllPages<RawBooking>(
    "/holidaze/bookings",
    (data) =>
      (data as RawBooking[]).filter((b) => (b as any).venue.id === venueId),
    authHeaders(token),
    { _venue: true }
  );
}
