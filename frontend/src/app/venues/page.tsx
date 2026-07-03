import Header from "@/components/Header";
import { getVenues } from "@/lib/data";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Venues — Live / BKK",
};

export default async function VenuesPage() {
  const venues = await getVenues();
  const list = Object.values(venues).sort(
    (a, b) => b.upcomingEventsCount - a.upcomingEventsCount
  );

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Venues</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:bg-elevated"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-elevated transition-colors group-hover:bg-accent/10">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-text-primary">
                  {venue.name}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {venue.upcomingEventsCount} upcoming
                  {venue.type && venue.type !== "other" && (
                    <span className="text-text-tertiary"> · {venue.type}</span>
                  )}
                </p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-text-tertiary transition-colors group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
