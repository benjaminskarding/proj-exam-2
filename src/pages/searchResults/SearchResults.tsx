import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import Fuse from "fuse.js";
import pLimit from "p-limit";

import { searchVenues } from "../../api/venues";
import { isVenueAvailableForDates } from "../../utils/availabilityHelper";

import { Venue } from "../../rulesets/types";
import VenueCard from "../../components/VenueCard";
import { ArrowLeft } from "lucide-react";

export default function SearchResults() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const term = params.get("q")?.trim() ?? "";
  const guests = Number(params.get("guests") ?? "1");
  // parse once whenever the URL search-string changes
  const { checkIn, checkOut } = useMemo(() => {
    const qs = new URLSearchParams(search);

    const ciRaw = qs.get("checkIn");
    const coRaw = qs.get("checkOut");

    return {
      checkIn: ciRaw ? new Date(ciRaw) : null,
      checkOut: coRaw ? new Date(coRaw) : null,
    };
  }, [search]); // only rerun when the query-string itself changes

  /* state  */
  const [all, setAll] = useState<Venue[]>([]);
  const [filtered, setFiltered] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // one cache to rule them all — avoids refetching the same venue
  const availCache = useRef<Record<string, boolean>>({}).current;

  // run search when term or guests change
  useEffect(() => {
    if (!term) return;
    setLoading(true);

    (async () => {
      const list = await searchVenues(term);
      setAll(list.filter((v) => v.maxGuests >= guests));
      setLoading(false);
    })();
  }, [term, guests]);

  // fuzzy search setup — don’t rebuild on every render
  const fuse = useMemo(
    () =>
      new Fuse(all, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: ["name", "description", "location.city"],
      }),
    [all]
  );

  // if date range is selected, check availability and then filter
  useEffect(() => {
    // no dates selected → just fuzzy filter
    if (!checkIn || !checkOut) {
      setFiltered(term ? fuse.search(term).map((h) => h.item) : all);
      return;
    }

    let cancelled = false;
    setChecking(true);

    const limit = pLimit(8); // dont overload API
    const tasks = all.map((v) =>
      limit(async () => {
        if (availCache[v.id] !== undefined) return availCache[v.id];

        const ok = await isVenueAvailableForDates(v.id, checkIn, checkOut);
        availCache[v.id] = ok;
        return ok;
      })
    );

    Promise.all(tasks).then((flags) => {
      if (cancelled) return;

      // filter the ones that are actually available
      const available = all.filter((_, i) => flags[i]);
      // run fuzzy search again on only those
      const final = term
        ? new Fuse(available, {
            threshold: 0.35,
            ignoreLocation: true,
            keys: ["name", "description", "location.city"],
          })
            .search(term)
            .map((h) => h.item)
        : available;

      setFiltered(final);
      setChecking(false);
    });
    // in case user leaves before we're done
    return () => {
      cancelled = true;
    };
  }, [all, term, checkIn, checkOut, availCache, fuse]);

  // if no term, show message instead of blank screen
  if (!term) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg">Please provide a search term.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 pt-10 pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-medium text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <h1 className="mb-6 text-3xl font-bold">
          {checking ? "Checking availability…" : "Results"} for{" "}
          <span className="text-emerald-700">&ldquo;{term}&rdquo;</span>
        </h1>

        {loading ? (
          <p>Loading venues…</p>
        ) : filtered.length === 0 ? (
          <p>No venues matched those filters.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((v) => (
              <VenueCard key={v.id} venue={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
