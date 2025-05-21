import { fetchVenueById } from "../api/venues";
import { overlap } from "./dateHelper";
import { Booking } from "../rulesets/types";

export async function isVenueAvailableForDates(
  id: string,
  from: Date,
  to: Date
): Promise<boolean> {
  try {
    const venue = await fetchVenueById(id, { bookings: true });
    const bookings = venue.bookings as Booking[];

    return !bookings.some((b) =>
      overlap(new Date(b.dateFrom), new Date(b.dateTo), from, to)
    );
  } catch {
    return true;
  }
}
