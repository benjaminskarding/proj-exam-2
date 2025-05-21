import { Link } from "react-router-dom";
import { Star as StarIcon } from "lucide-react";
import { Venue } from "../rulesets/types";

/* Label helpers */
const isSuperhost = (rating?: number) => rating != null && rating >= 4.8;

const isNewVenue = (created?: string | Date) => {
  if (!created) return false;
  const daysOld =
    (Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24);
  return daysOld <= 30;
};

// extracts a readable amenity list from meta
const listAmenities = (v: Venue) => {
  const items: string[] = [];
  if (v.meta?.wifi) items.push("WiFi");
  if (v.meta?.parking) items.push("Parking");
  if (v.meta?.breakfast) items.push("Breakfast");
  if (v.meta?.pets) items.push("Pets Allowed");
  return items.length ? items.join(" · ") : "None";
};

/* Props */
type Props = {
  venue: Venue;
  /* makes the card static (no link) — used in manager dashboard */
  disableLink?: boolean;
  /* only the image is clickable */
  linkOnPhotoOnly?: boolean;
};

export default function VenueCard({
  venue,
  disableLink = false,
  linkOnPhotoOnly = false,
}: Props) {
  const cityDisplay = venue.location?.city?.trim() || "Location Unspecified";

  /* Photo */
  const photo = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-slate-100">
      <img
        src={venue.media?.[0]?.url}
        alt={venue.media?.[0]?.alt || venue.name}
        className="h-full w-full object-cover"
        onError={(e) => (e.currentTarget.style.opacity = "0")}
      />
      {(isSuperhost(venue.rating) || isNewVenue(venue.created)) && (
        <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
          {isSuperhost(venue.rating) ? "Superhost" : "New"}
        </span>
      )}
    </div>
  );

  const details = (
    <div className="space-y-1 p-4">
      {/* Title + rating 2-column grid*/}
      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <h3
          className="truncate capitalize text-base font-semibold leading-tight"
          title={venue.name}
        >
          {venue.name}
        </h3>
        <span className="whitespace-nowrap text-sm text-slate-700 flex items-center">
          <StarIcon className="mr-0.5 h-4 w-4 fill-amber-400 text-amber-400" />
          {venue.rating?.toFixed(2) ?? "N/A"}
        </span>
      </div>

      <p className="text-sm text-slate-500 capitalize">{cityDisplay}</p>

      <p className="text-sm text-slate-600">
        Amenities: {listAmenities(venue)}
      </p>

      <p className="text-sm text-slate-500">Max: {venue.maxGuests} guests</p>

      <p className="pt-1 text-lg font-semibold">
        ${venue.price}
        <span className="font-normal text-slate-500"> / night</span>
      </p>
    </div>
  );

  /* card wrapper — layout depends on props */
  const card = (
    <div className="overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-lg">
      {disableLink ? (
        photo
      ) : linkOnPhotoOnly ? (
        <Link to={`/venue/${venue.id}`}>{photo}</Link>
      ) : (
        photo
      )}
      {details}
    </div>
  );

  // if link wrapping the whole card is allowed, do it
  if (disableLink || linkOnPhotoOnly) return card;
  return <Link to={`/venue/${venue.id}`}>{card}</Link>;
}
