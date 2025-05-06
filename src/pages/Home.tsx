import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
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
} from "lucide-react";

function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [visibleCount, setVisibleCount] = useState(36);
  const [sortBy, setSortBy] = useState<"default" | "newest" | "oldest">(
    "default"
  );
  const [showSort, setShowSort] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Venue[]>([]);
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  // Load all venues
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchVenues();
        setVenues(data);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  // Load popular venues
  const [popularVenues, setPopularVenues] = useState<Venue[]>([]);

  useEffect(() => {
    if (venues.length === 0) return;

    const sorted = [...venues].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
    );
    setPopularVenues(sorted.slice(0, 4));
  }, [venues]);

  // Search
  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const result = await searchVenues(debouncedQuery);
        setSuggestions(result);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Live search failed", err);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  // Choose category
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filters
  type FilterKeys = "wifi" | "parking" | "breakfast" | "pets";

  const [filters, setFilters] = useState<Record<FilterKeys, boolean>>({
    wifi: false,
    parking: false,
    breakfast: false,
    pets: false,
  });

  // Apply filters
  const filteredVenues = [...venues]
    .filter((venue) => {
      const target = selectedCategory.toLowerCase();
      const combinedText = `${venue.name} ${
        venue.description ?? ""
      }`.toLowerCase();

      const matchesCategory =
        selectedCategory === "All" || combinedText.includes(target);

      const matchesFilters = (
        Object.entries(filters) as [FilterKeys, boolean][]
      ).every(([key, value]) => !value || venue.meta?.[key] === true);

      return matchesCategory && matchesFilters;
    })
    .sort((a, b) => {
      const aDate = new Date(a.created ?? 0).getTime();
      const bDate = new Date(b.created ?? 0).getTime();

      if (sortBy === "newest") {
        return bDate - aDate;
      }
      if (sortBy === "oldest") {
        return aDate - bDate;
      }
      return 0;
    });

  // Open filters dropdown
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-emerald-800 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
          <div className="max-w-2xl w-full">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Find your perfect getaway
            </h1>
            <p className="text-lg mb-8 opacity-90 text-center">
              Discover unique stays to live, work, or just relax
            </p>

            <div className="relative bg-white p-4 rounded-lg shadow-lg text-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="">
                  <label className="text-sm font-medium mb-1 block">
                    Where
                  </label>
                  <input
                    placeholder="Destination / Venue"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">When</label>
                  <input
                    placeholder="Add dates"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Who</label>
                  <input
                    placeholder="Add guests"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-4 right-4 z-50 bg-white border rounded-md mt-2 max-h-60 overflow-y-auto shadow-lg">
                  {suggestions.map((venue) => (
                    <li
                      key={venue.id}
                      onClick={() => {
                        setVenues([venue]);
                        setSearchQuery(venue.name);
                        setShowSuggestions(false);
                        navigate(`/venue/${venue.id}`);
                      }}
                      className="px-4 py-2 hover:bg-emerald-100 cursor-pointer text-sm"
                    >
                      {venue.name}
                    </li>
                  ))}
                </ul>
              )}
              <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md">
                Search
              </button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-20 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Scenic landscape"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="container mx-auto px-4 py-8 border-b overflow-x-auto">
        <div className="flex gap-8 justify-start w-full">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg"
            onClick={() => setSelectedCategory("All")}
          >
            <span>All Properties</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setSelectedCategory("Mountain")}
          >
            <MountainIcon className="h-4 w-4" />
            <span>Mountain</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setSelectedCategory("Beach")}
          >
            <WavesIcon className="h-4 w-4" />
            <span>Beach</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setSelectedCategory("Cabin")}
          >
            <TentTreeIcon className="h-4 w-4" />
            <span>Cabin</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setSelectedCategory("Lakefront")}
          >
            <TreesIcon className="h-4 w-4" />
            <span>Lakefront</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg"
            onClick={() => setSelectedCategory("Luxury")}
          >
            <SparklesIcon className="h-4 w-4" />
            <span>Luxury</span>
          </button>
        </div>
      </div>

      {/* Filter and Sort Buttons */}
      <div className="flex flex-col items-center gap-4 mt-4">
        {/* Filters + Sort in one row */}
        <div className="container mx-auto px-4 flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-100 transition text-sm"
          >
            <SlidersHorizontalIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setShowSort((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-100 transition text-sm"
          >
            <SlidersHorizontalIcon className="h-4 w-4" />
            <span>
              Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </span>
          </button>
        </div>
        <div
          className={`transition-all duration-300 overflow-hidden ${
            showSort
              ? "opacity-100 max-h-40"
              : "opacity-0 -translate-y-2 max-h-0"
          }`}
        >
          <div className="flex justify-center gap-3">
            {["default", "newest", "oldest"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSortBy(option as "default" | "newest" | "oldest");
                  setShowSort(false);
                }}
                className={`px-4 py-2 rounded-full border text-sm capitalize transition-colors duration-200 ${
                  sortBy === option
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Options Panel */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            showFilters
              ? "opacity-100 max-h-40"
              : "opacity-0 -translate-y-2 max-h-0"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {Object.entries(filters).map(([key, value]) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize transition-colors duration-200 ${
                  value
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      [key as FilterKeys]: !prev[key as FilterKeys],
                    }))
                  }
                  className="sr-only"
                />
                {key}
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* Property Listings */}
      <main className="container mx-auto px-4 pb-4 flex-1">
        <h2 className="text-2xl font-bold mb-6">Featured Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVenues.slice(0, visibleCount).map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
        {visibleCount < venues.length && (
          <div className="mt-14 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 36)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-md transition"
            >
              Show More
            </button>
          </div>
        )}
      </main>

      {/* Popular Destinations */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Popular Venues</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
