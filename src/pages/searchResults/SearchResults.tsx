import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Fuse from "fuse.js";
import pLimit from "p-limit";

import { searchVenues, fetchVenueById } from "../../api/venues";
import { Venue } from "../../rulesets/types";
import VenueCard from "../../components/VenueCard";

function overlap(a1: Date, a2: Date, b1: Date, b2: Date) {
  return a1 <= b2 && b1 <= a2;
}

export default function SearchResults() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const term = params.get("q")?.trim() ?? "";
  const guests = Number(params.get("guests") ?? "1");
  const checkIn = params.get("checkIn")
    ? new Date(params.get("checkIn")!)
    : null;
  const checkOut = params.get("checkOut")
    ? new Date(params.get("checkOut")!)
    : null;

  /* comp state */
  const [all, setAll] = useState<Venue[]>([]);
  const [filtered, setFiltered] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  /* per run availability cache ─────────────── */
  const availCache = useRef<Record<string, boolean>>({}).current;

  /* fetch keywrod list once */
  useEffect(() => {
    if (!term) return;
    setLoading(true);

    (async () => {
      const list = await searchVenues(term);
      setAll(list.filter((v) => v.maxGuests >= guests));
      setLoading(false);
    })();
  }, [term, guests]);

  /* FUZZY RANKER MEMOISED */
  const fuse = useMemo(
    () =>
      new Fuse(all, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: ["name", "description", "location.city"],
      }),
    [all]
  );

  /* AVAILABILITY PASS  */
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setFiltered(term ? fuse.search(term).map((h) => h.item) : all);
      return;
    }

    let cancelled = false;
    setChecking(true);

    const limit = pLimit(8);
    const tasks = all.map((v) =>
      limit(async () => {
        if (availCache[v.id] !== undefined) return availCache[v.id];

        try {
          const full = await fetchVenueById(v.id, { bookings: true });
          const clash = full.bookings?.some((b: any) =>
            overlap(new Date(b.dateFrom), new Date(b.dateTo), checkIn, checkOut)
          );
          return (availCache[v.id] = !clash);
        } catch {
          return (availCache[v.id] = true); // network hiccup -> assume OK
        }
      })
    );

    Promise.all(tasks).then((flags) => {
      if (cancelled) return;
      const available = all.filter((_, i) => flags[i]);
      setFiltered(term ? fuse.search(term).map((h) => h.item) : available);
      setChecking(false);
    });

    return () => {
      cancelled = true; // abort if component unmounts
    };
  }, [all, fuse, term, checkIn, checkOut, availCache]);

  if (!term) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-lg">Please provide a search term.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">
          {checking ? "Checking availability…" : "Results"} for&nbsp;
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
