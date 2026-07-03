"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Calendar } from "lucide-react";
import { Concert, Venue } from "@/lib/types";
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

const ALL_SCENES = [
  "K-Pop",
  "Electronic",
  "Livehouse",
  "Jazz & Classical",
  "International",
  "Festival",
  "Rock & Metal",
  "Hip-Hop",
  "Indie",
  "Thai Pop",
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
  const initialScene = searchParams.get("scene") || "";
  const initialMonth = searchParams.get("month") || "";
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedScene, setSelectedScene] = useState<string>(initialScene);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  // Available months from data, sorted
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    concerts.forEach((c) => {
      months.add(c.date.startDate.slice(0, 7));
    });
    return Array.from(months).sort();
  }, [concerts]);

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

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

    if (selectedMonth) {
      list = list.filter((c) => c.date.startDate.startsWith(selectedMonth));
    }

    if (selectedGenre) {
      list = list.filter((c) => c.genres.includes(selectedGenre));
    }

    if (selectedScene) {
      const sceneLabel = selectedScene
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      list = list.filter((c) =>
        c.sceneTags.some((s) => s.toLowerCase() === selectedScene.toLowerCase() || s === sceneLabel)
      );
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
  }, [concerts, venues, query, selectedGenre, selectedScene, selectedMonth, initialWhen]);

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
      <div className="mb-6 flex items-center gap-2 border border-border bg-surface px-3 py-3">
        <Search className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search concerts, artists, venues..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="shrink-0">
            <X className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Month chips */}
      {availableMonths.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMonth("")}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors border ${
              selectedMonth === ""
                ? "bg-text-primary text-white border-text-primary"
                : "bg-background text-text-secondary border-border hover:border-text-primary"
            }`}
          >
            All months
          </button>
          {availableMonths.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m === selectedMonth ? "" : m)}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors border ${
                selectedMonth === m
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-background text-text-secondary border-border hover:border-text-primary"
              }`}
            >
              {monthLabel(m)}
            </button>
          ))}
        </div>
      )}

      {/* Genre chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre("")}
          className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors border ${
            selectedGenre === ""
              ? "bg-text-primary text-white border-text-primary"
              : "bg-background text-text-secondary border-border hover:border-text-primary"
          }`}
        >
          All
        </button>
        {ALL_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g === selectedGenre ? "" : g)}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors border ${
              selectedGenre === g
                ? "bg-text-primary text-white border-text-primary"
                : "bg-background text-text-secondary border-border hover:border-text-primary"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Scene chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedScene("")}
          className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors border ${
            selectedScene === ""
              ? "bg-text-primary text-white border-text-primary"
              : "bg-background text-text-secondary border-border hover:border-text-primary"
          }`}
        >
          All scenes
        </button>
        {ALL_SCENES.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedScene(s === selectedScene ? "" : s)}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors border ${
              selectedScene === s
                ? "bg-text-primary text-white border-text-primary"
                : "bg-background text-text-secondary border-border hover:border-text-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mb-6 text-xs text-text-tertiary uppercase tracking-wide">
        {filtered.length} concert{filtered.length !== 1 ? "s" : ""} found
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <Calendar className="mb-2 h-8 w-8" strokeWidth={1.5} />
          <p className="text-sm">No concerts match your search.</p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedGenre("");
              setSelectedScene("");
              setSelectedMonth("");
            }}
            className="mt-2 text-xs text-text-secondary hover:text-text-primary uppercase tracking-wide underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {Object.entries(grouped).map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-6 text-2xl font-bold text-text-primary font-display">
                {new Date(month + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
        <div className="py-12 text-center text-sm text-text-tertiary uppercase tracking-wide">
          Loading concerts...
        </div>
      }
    >
      <ConcertsInner concerts={concerts} venues={venues} />
    </Suspense>
  );
}
