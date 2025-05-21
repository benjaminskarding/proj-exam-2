import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import Fuse from "fuse.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchVenues, searchVenues } from "../api/venues";
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
import { isVenueAvailableForDates } from "../utils/availabilityHelper";

// used to filter by themed categories
type Category = "All" | "Mountain" | "Beach" | "Cabin" | "Lakefront" | "Luxury";

const categories: { label: Category; icon?: React.ReactNode }[] = [
  { label: "All" },
  { label: "Mountain", icon: <MountainIcon className="h-4 w-4" /> },
  { label: "Beach", icon: <WavesIcon className="h-4 w-4" /> },
  { label: "Cabin", icon: <TentTreeIcon className="h-4 w-4" /> },
  { label: "Lakefront", icon: <TreesIcon className="h-4 w-4" /> },
  { label: "Luxury", icon: <SparklesIcon className="h-4 w-4" /> },
];

export default function Home() {
  const navigate = useNavigate();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  // fetch all venues once on mount
  useEffect(() => {
    (async () => {
      setLoadingVenues(true);
      setVenues(await fetchVenues());
      setLoadingVenues(false);
    })();
  }, []);

  // search + filters state
  const [query, setQuery] = useState("");
  const [debounced] = useDebounce(query, 300);
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

  // fuzzy search helper
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

  // cache for venue availability per session
  const availCache = useRef<Record<string, boolean>>({}).current;

  // fetches detailed bookings for venue and caches result
  const isVenueAvailable = useCallback(
    async (v: Venue) => {
      if (!checkIn || !checkOut) return true;
      if (availCache[v.id] !== undefined) return availCache[v.id];

      const available = await isVenueAvailableForDates(v.id, checkIn, checkOut);
      availCache[v.id] = available;
      return available;
    },
    [checkIn, checkOut]
  );

  // live suggestions for location/venue name search
  const [suggestions, setSuggestions] = useState<Venue[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [showAllSug, setShowAllSug] = useState(false);
  const SUG_LIMIT = 8;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const q = debounced.trim();
      if (!q) {
        mounted && setSuggestions([]);
        return;
      }
      const local = fuse.search(q).map((h) => h.item);
      const base = local.length ? local : await searchVenues(q);
      const enough = base.filter((v) => v.maxGuests >= guestsWanted);
      mounted && setSuggestions(enough);
    })();
    return () => {
      mounted = false;
    };
  }, [debounced, guestsWanted, fuse]);

  // static filtering by guests, category, amenities
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

  // availability check is manual (on search click)
  const [dateFiltered, setDateFiltered] = useState<Venue[]>(baseFiltered);
  const [checking, setChecking] = useState(false);
  const [runAvail, setRunAvail] = useState(false);

  useEffect(() => {
    if (!runAvail) {
      setDateFiltered(baseFiltered);
    }
  }, [baseFiltered, runAvail]);

  useEffect(() => {
    if (!runAvail) return;

    if (!checkIn || !checkOut) {
      setDateFiltered(baseFiltered);
      setRunAvail(false);
      return;
    }
    setChecking(true);
    Promise.all(baseFiltered.map(isVenueAvailable)).then((flags) => {
      setDateFiltered(baseFiltered.filter((_, i) => flags[i]));
      setChecking(false);
      setRunAvail(false);
    });
  }, [runAvail, baseFiltered, checkIn, checkOut, isVenueAvailable]);

  /* sort + pagination */
  const sorted = useMemo(() => {
    const a = [...dateFiltered];
    if (sortBy === "default") return a;
    const dir = sortBy === "newest" ? -1 : 1;
    return a.sort(
      (x, y) =>
        dir *
        (new Date(x.created ?? 0).getTime() -
          new Date(y.created ?? 0).getTime())
    );
  }, [dateFiltered, sortBy]);

  const [visibleCount, setVisible] = useState(36);
  // popular = top 4 venues by rating
  const popular = useMemo(
    () =>
      [...venues].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4),
    [venues]
  );

  // sets up the /search route with query params
  const pushSearchRoute = () => {
    const qs = new URLSearchParams();
    if (debounced.trim()) qs.set("q", debounced.trim());
    qs.set("guests", guestsWanted.toString());
    if (checkIn) qs.set("checkIn", checkIn.toISOString().slice(0, 10));
    if (checkOut) qs.set("checkOut", checkOut.toISOString().slice(0, 10));
    navigate(`/search?${qs.toString()}`);
  };

  /* handlers */
  const handleSearchClick = () => {
    setRunAvail(true);
    pushSearchRoute();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearchClick();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* hero + search bar */}
      <div className="relative py-12 sm:py-16 md:py-24 bg-gradient-to-r from-emerald-800 to-emerald-600 text-white">
        <img
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1470&q=80"
          alt=""
        />
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
          <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
              Find your perfect getaway
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-8 opacity-90 text-center">
              Discover unique stays to live, work, or just relax
            </p>
            <form
              onSubmit={handleSubmit}
              className="relative bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg text-slate-800 space-y-4"
            >
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
                    ).map((v) => (
                      <li
                        key={v.id}
                        onMouseDown={() => {
                          navigate(`/venue/${v.id}`);
                          setShowSug(false);
                        }}
                        className="px-4 py-2 text-sm flex justify-between gap-2 cursor-pointer hover:bg-emerald-100"
                      >
                        <span className="font-medium">{v.name}</span>
                        <span className="text-slate-500 truncate">
                          {v.location?.city ?? ""}
                        </span>
                      </li>
                    ))}
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
              {/* dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {/* guests */}
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <div className="flex items-center border rounded-md w-full sm:w-max">
                  <button
                    type="button"
                    disabled={guestsWanted <= 1}
                    onClick={() => setGuestsWanted((g) => Math.max(1, g - 1))}
                    className="p-2 disabled:opacity-40"
                    aria-label="decrease amount of guests to book"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4">{guestsWanted}</span>
                  <button
                    type="button"
                    onClick={() => setGuestsWanted((g) => g + 1)}
                    className="p-2"
                    aria-label="increase amount of guests to book"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {/* search button */}
              <button
                type="submit"
                disabled={checking}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-2 rounded-md"
              >
                {checking ? "Checking…" : "Search"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* category bar */}
      <div className="container mx-auto px-4 py-4 md:py-8 border-b">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
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

      {/* filter and sort toggles */}
      <div className="flex flex-col items-center gap-4 mt-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
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
          <div className="flex flex-wrap sm:flex-nowrap justify-center gap-3">
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
          <div className="flex flex-wrap justify-center gap-3 pt-2 pb-6">
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
                    setFilters((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                />
                {key}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* main grid */}
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-md w-full sm:w-auto"
                >
                  Show More
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* popular venues */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Popular Venues</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {popular.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      </section>
    </div>
  );
}
