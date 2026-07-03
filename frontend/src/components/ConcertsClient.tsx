"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Calendar } from "lucide-react";
import { Concert, Venue, relativeDate } from "@/lib/types";
import EventCard from "./EventCard";

const ALL_GENRES = [
  "pop",
  "rock",
  "electronic",
  "jazz",
  "hip-hop",
  "indie",
  "metal",
  "classical",
  "festival",
  "other",
];

function ConcertsInner({
  concerts,
  venues,
}: {
  concerts: Concert[];
  venues: Record<string, Venue>;
}) {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get("genre") || "";
  const initialWhen = searchParams.get("when") || "";

  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);

  const filtered = useMemo(() => {
    let list = concerts;

    if (initialWhen === "tonight") {
      const today = new Date().toISOString().slice(0, 10);
      list = list.filter((c) => c.date.startDate === today);
    } else if (initialWhen === "weekend") {
      const today = new Date();
      const day = today.getDay();
      const sat = new Date(today);
      sat.setDate(today.getDate() + ((6 - day + 7) % 7));
      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      list = list.filter((c) => c.date.startDate >= fmt(sat) && c.date.startDate <= fmt(sun));
    } else if (initialWhen === "month") {
      const today = new Date().toISOString().slice(0, 10);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);
      list = list.filter((c) => c.date.startDate >= today && c.date.startDate <= monthEnd);
    }

    if (selectedGenre) {
      list = list.filter((c) => c.genres.includes(selectedGenre));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.artists.some((a) => a.toLowerCase().includes(q)) ||
          (venues[c.venueId]?.name || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [concerts, venues, query, selectedGenre, initialWhen]);

  const grouped = useMemo(() => {
    const g: Record<string, Concert[]> = {};
    filtered.forEach((c) => {
      const month = c.date.startDate.slice(0, 7);
      if (!g[month]) g[month] = [];
      g[month].push(c);
    });
    return g;
  }, [filtered]);

  return (
    <div>
      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-text-tertiary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search concerts, artists, venues..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="shrink-0">
            <X className="h-4 w-4 text-text-tertiary" />
          </button>
        )}
      </div>

      {/* Genre chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre("")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedGenre === ""
              ? "bg-accent text-white"
              : "bg-elevated text-text-secondary hover:bg-border"
          }`}
        >
          All
        </button>
        {ALL_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g === selectedGenre ? "" : g)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              selectedGenre === g
                ? "bg-accent text-white"
                : "bg-elevated text-text-secondary hover:bg-border"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs text-text-tertiary">
        {filtered.length} concert{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <Calendar className="mb-2 h-8 w-8" />
          <p className="text-sm">No concerts match your search.</p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedGenre("");
            }}
            className="mt-2 text-xs text-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-4 text-lg font-bold text-text-primary">
                {new Date(month + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                {items.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    venue={venues[event.venueId]}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConcertsClient({
  concerts,
  venues,
}: {
  concerts: Concert[];
  venues: Record<string, Venue>;
}) {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-sm text-text-tertiary">
          Loading concerts...
        </div>
      }
    >
      <ConcertsInner concerts={concerts} venues={venues} />
    </Suspense>
  );
}
