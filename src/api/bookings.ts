import { safeJSON, authHeaders, buildUrl, fetchAllPages } from "./utils";
import { Venue } from "../rulesets/types";

// limited booking shape used for calendar blocking in venuedetails (booking page)
export type RawBooking = {
  dateFrom: string;
  dateTo: string;
  customer?: { name: string };
};

// full booking shape
export type Booking = {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
  venue: Venue;
};

// create a booking — expects token in localStorage
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

// gets all bookings for the current user, with venue info included
export function fetchMyBookings(profileName: string, token: string) {
  return fetchAllPages<Booking>(
    `/holidaze/profiles/${encodeURIComponent(profileName)}/bookings`,
    (data) => data as Booking[],
    authHeaders(token),
    { _venue: true }
  );
}

// grabs all bookings for a specific venue (just dates + customer)
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
