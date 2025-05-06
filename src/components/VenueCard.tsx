import { Venue } from "../rulesets/types";
import { StarIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  venue: Venue;
};

export default function VenueCard({ venue }: Props) {
  return (
    <Link to={`venue/${venue.id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
        <div className="relative aspect-[4/3]">
          <img
            src={venue.media?.[0]?.url || "https://via.placeholder.com/300x200"}
            alt={venue.media?.[0]?.alt || venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
            {venue.meta?.wifi ? "Superhost" : "New"}
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between mb-1">
            <h3 className="font-semibold truncate max-w-[80%]">{venue.name}</h3>
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-yellow-400 stroke-none" />
              <span>{venue.rating?.toFixed(2) || "4.90"}</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-1">
            {venue.location?.city || "Unknown location"}
          </p>
          <p className="text-slate-500 text-sm mb-3">
            Max: {venue.maxGuests} guests · WiFi:{" "}
            {venue.meta?.wifi ? "Yes" : "No"}
          </p>
          <p className="font-semibold">
            ${venue.price}{" "}
            <span className="font-normal text-slate-500">night</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
