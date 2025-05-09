import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import Fuse from "fuse.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchVenues, searchVenues, fetchVenueById } from "../api/venues";
import { Venue } from "../rulesets/types";
import VenueCard from "../components/VenueCard";
import {
  TreesIcon,
  MountainIcon,
  WavesIcon,
  TentTreeIcon,
  SparklesIcon,
  SlidersHorizontalIcon,
  PlusIcon,
  MinusIcon,
} from "lucide-react";

type Category = "All" | "Mountain" | "Beach" | "Cabin" | "Lakefront" | "Luxury";

const categories: { label: Category; icon?: React.ReactNode }[] = [
  { label: "All" },
  { label: "Mountain", icon: <MountainIcon className="h-4 w-4" /> },
  { label: "Beach", icon: <WavesIcon className="h-4 w-4" /> },
  { label: "Cabin", icon: <TentTreeIcon className="h-4 w-4" /> },
  { label: "Lakefront", icon: <TreesIcon className="h-4 w-4" /> },
  { label: "Luxury", icon: <SparklesIcon className="h-4 w-4" /> },
];

function overlap(a1: Date, a2: Date, b1: Date, b2: Date) {
  return a1 <= b2 && b1 <= a2;
}

const SHOW_DIMMED = false;

export default function Home() {
  const navigate = useNavigate();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  useEffect(() => {
    (async () => {
      setLoadingVenues(true);
      setVenues(await fetchVenues());
      setLoadingVenues(false);
    })();
  }, []);

  const [query, setQuery] = useState("");
  const [debounced] = useDebounce(query, 200);
  const [guestsWanted, setGuestsWanted] = useState(1);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const [category, setCategory] = useState<Category>("All");
  type FilterKey = "wifi" | "parking" | "breakfast" | "pets";
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    wifi: false,
    parking: false,
    breakfast: false,
    pets: false,
  });
  const [sortBy, setSortBy] = useState<"default" | "newest" | "oldest">(
    "default"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(venues, {
        threshold: 0.35,
        ignoreLocation: true,
        keys: [
          "name",
          "description",
          "location.city",
          "location.country",
          "location.continent",
        ],
      }),
    [venues]
  );

  const availCache = useRef<Record<string, boolean>>({}).current;
  const isVenueAvailable = useCallback(
    async (v: Venue) => {
      if (!checkIn || !checkOut) return true;
      if (availCache[v.id] !== undefined) return availCache[v.id];
      try {
        const full = await fetchVenueById(v.id, { bookings: true });
        const clash = full.bookings?.some((b: any) =>
          overlap(new Date(b.dateFrom), new Date(b.dateTo), checkIn, checkOut)
        );
        availCache[v.id] = !clash;
        return !clash;
      } catch {
        availCache[v.id] = true;
        return true;
      }
    },
    [checkIn, checkOut, availCache]
  );

  const [suggestions, setSuggestions] = useState<Venue[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [showAllSug, setShowAllSug] = useState(false);
  const SUG_LIMIT = 8;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const q = debounced.trim();
      if (!q) {
        if (mounted) setSuggestions([]);
        return;
      }
      const local = fuse.search(q).map((h) => h.item);
      const base = local.length ? local : await searchVenues(q);
      const enough = base.filter((v) => v.maxGuests >= guestsWanted);
      const flags = await Promise.all(enough.map(isVenueAvailable));
      const ok: Venue[] = [];
      enough.forEach((v, i) => {
        if (flags[i] || SHOW_DIMMED) ok.push(v);
      });
      if (mounted) setSuggestions(ok);
    })();
    return () => {
      mounted = false;
    };
  }, [debounced, guestsWanted, checkIn, checkOut, fuse]);

  // main grid filtering
  const baseFiltered = useMemo(() => {
    return venues.filter((v) => {
      if (v.maxGuests < guestsWanted) return false;
      const blob = `${v.name} ${v.description ?? ""}`.toLowerCase();
      if (category !== "All" && !blob.includes(category.toLowerCase()))
        return false;
      return (Object.entries(filters) as [FilterKey, boolean][]).every(
        ([k, active]) => !active || v.meta?.[k]
      );
    });
  }, [venues, guestsWanted, category, filters]);

  const [dateFiltered, setDateFiltered] = useState<Venue[]>(baseFiltered);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setDateFiltered(baseFiltered);
      return;
    }
    setChecking(true);
    Promise.all(baseFiltered.map(isVenueAvailable)).then((flags) => {
      setDateFiltered(baseFiltered.filter((_, i) => flags[i]));
      setChecking(false);
    });
  }, [baseFiltered, checkIn, checkOut, isVenueAvailable]);

  // sort
  const sorted = useMemo(() => {
    const a = [...dateFiltered];
    if (sortBy === "default") return a;
    const dir = sortBy === "newest" ? -1 : 1;
    return a.sort(
      (a, b) =>
        dir *
        (new Date(a.created ?? 0).getTime() -
          new Date(b.created ?? 0).getTime())
    );
  }, [dateFiltered, sortBy]);

  // pagination + popular
  const [visibleCount, setVisible] = useState(36);
  const popular = useMemo(
    () =>
      [...venues].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4),
    [venues]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="relative py-16 bg-gradient-to-r from-emerald-800 to-emerald-600 text-white">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1470&q=80"
          alt=""
        />
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Find your perfect getaway
            </h1>
            <p className="text-lg mb-8 opacity-90 text-center">
              Discover unique stays to live, work, or just relax
            </p>
            <div className="relative bg-white p-4 rounded-lg shadow-lg text-slate-800 space-y-4">
              <div className="relative">
                <label className="text-sm font-medium mb-1 block">Where</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSug(true)}
                  onBlur={() => setTimeout(() => setShowSug(false), 150)}
                  placeholder="Destination / Venue"
                  className="w-full p-2 border rounded-md"
                />
                {showSug && suggestions.length > 0 && (
                  <ul className="absolute mt-2 left-0 right-0 bg-white border rounded-md shadow-lg z-50 max-h-72 overflow-y-auto">
                    {(showAllSug
                      ? suggestions
                      : suggestions.slice(0, SUG_LIMIT)
                    ).map((v) => {
                      const disabled =
                        v.maxGuests < guestsWanted ||
                        (checkIn && checkOut && availCache[v.id] === false);
                      if (!SHOW_DIMMED && disabled) return null;
                      return (
                        <li
                          key={v.id}
                          onMouseDown={() => {
                            if (disabled) return;
                            navigate(`/venue/${v.id}`);
                            setShowSug(false);
                          }}
                          className={`px-4 py-2 text-sm flex justify-between gap-2 cursor-pointer ${
                            disabled
                              ? "text-slate-400 cursor-not-allowed"
                              : "hover:bg-emerald-100"
                          }`}
                        >
                          <span className="font-medium">{v.name}</span>
                          <span className="text-slate-500 truncate">
                            {v.location?.city ?? ""}
                          </span>
                        </li>
                      );
                    })}
                    {suggestions.length > SUG_LIMIT && (
                      <li
                        onMouseDown={() => setShowAllSug((s) => !s)}
                        className="px-4 py-2 text-xs text-center text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                      >
                        {showAllSug ? "Show less" : "Show all matches"}
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Check-in
                  </label>
                  <DatePicker
                    selected={checkIn}
                    onChange={(d) => {
                      setCheckIn(d);
                      if (checkOut && d && d >= checkOut) setCheckOut(null);
                    }}
                    selectsStart
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={new Date()}
                    placeholderText="Add date"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Check-out
                  </label>
                  <DatePicker
                    selected={checkOut}
                    onChange={(d) => setCheckOut(d)}
                    selectsEnd
                    startDate={checkIn}
                    endDate={checkOut}
                    minDate={checkIn ?? new Date()}
                    placeholderText="Add date"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <div className="flex items-center border rounded-md w-max">
                  <button
                    type="button"
                    disabled={guestsWanted <= 1}
                    onClick={() => setGuestsWanted((g) => Math.max(1, g - 1))}
                    className="p-2 disabled:opacity-40"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4">{guestsWanted}</span>
                  <button
                    type="button"
                    onClick={() => setGuestsWanted((g) => g + 1)}
                    className="p-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                disabled={checking}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-2 rounded-md"
              >
                {checking ? "Checking…" : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 border-b overflow-x-auto">
        <div className="flex gap-8 w-full">
          {categories.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setCategory(label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                category === label
                  ? "bg-emerald-50 text-emerald-600"
                  : "hover:bg-slate-100"
              }`}
            >
              {icon} <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="container mx-auto px-4 flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-100 text-sm"
          >
            <SlidersHorizontalIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setShowSort((p) => !p)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-100 text-sm"
          >
            <SlidersHorizontalIcon className="h-4 w-4" />
            <span>Sort by: {sortBy}</span>
          </button>
        </div>
        <div
          className={`transition-all duration-300 overflow-hidden ${
            showSort
              ? "opacity-100 max-h-40"
              : "opacity-0 max-h-0 -translate-y-2"
          }`}
        >
          <div className="flex justify-center gap-3">
            {["default", "newest", "oldest"].map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSortBy(opt as typeof sortBy);
                  setShowSort(false);
                }}
                className={`px-4 py-2 rounded-full border text-sm capitalize ${
                  sortBy === opt
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`transition-all duration-300 overflow-hidden ${
            showFilters
              ? "opacity-100 max-h-40"
              : "opacity-0 max-h-0 -translate-y-2"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {(Object.keys(filters) as FilterKey[]).map((key) => (
              <label
                key={key}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm capitalize cursor-pointer ${
                  filters[key]
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={filters[key]}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                />
                {key}
              </label>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-4 flex-1">
        <h2 className="text-2xl font-bold mb-6">Featured Properties</h2>
        {loadingVenues ? (
          <p>Loading…</p>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sorted.slice(0, visibleCount).map((v) => (
                <VenueCard key={v.id} venue={v} />
              ))}
            </div>
            {visibleCount < sorted.length && (
              <div className="mt-14 text-center">
                <button
                  onClick={() => setVisible((c) => c + 36)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-md"
                >
                  Show More
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Popular Venues</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {popular.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      </section>
    </div>
  );
}
