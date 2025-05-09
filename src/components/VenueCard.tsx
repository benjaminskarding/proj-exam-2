import { Venue } from "../rulesets/types";
import { StarIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  venue: Venue;
  linkOnPhotoOnly?: boolean;
};

export default function VenueCard({ venue, linkOnPhotoOnly = false }: Props) {
  const media = venue.media?.[0];
  const hasWifi = Boolean(venue.meta?.wifi);
  const rating = venue.rating?.toFixed(2) ?? "N/A";
  const city = venue.location?.city ?? "Unknown location";

  const photo = (
    <div className="relative aspect-[4/3]">
      <img
        src={media?.url}
        alt={media?.alt || venue.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
        {hasWifi ? "Superhost" : "New"}
      </div>
    </div>
  );

  const cardInner = (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
      {linkOnPhotoOnly ? <Link to={`/venue/${venue.id}`}>{photo}</Link> : photo}
      <div className="p-4">
        <div className="flex justify-between mb-1">
          <h3 className="font-semibold truncate max-w-[80%]">{venue.name}</h3>
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 fill-yellow-400 stroke-none" />
            <span>{rating}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm mb-1">{city}</p>
        <p className="text-slate-500 text-sm mb-3">
          Max: {venue.maxGuests} guests · WiFi: {hasWifi ? "Yes" : "No"}
        </p>
        <p className="font-semibold">
          ${venue.price}{" "}
          <span className="font-normal text-slate-500">/ night</span>
        </p>
      </div>
    </div>
  );

  return linkOnPhotoOnly ? (
    cardInner
  ) : (
    <Link to={`/venue/${venue.id}`}>{cardInner}</Link>
  );
}
