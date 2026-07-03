import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { getConcerts, getVenues } from "@/lib/data";
import { ArrowRight, MapPin } from "lucide-react";

export default async function HomePage() {
  const concerts = await getConcerts();
  const venues = await getVenues();

  const today = new Date().toISOString().slice(0, 10);
  const weekendStart = new Date(Date.now() + ((6 - new Date().getDay() + 7) % 7) * 86400000)
    .toISOString()
    .slice(0, 10);
  const weekendEnd = new Date(Date.now() + ((8 - new Date().getDay() + 7) % 7) * 86400000)
    .toISOString()
    .slice(0, 10);
  const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const tonight = concerts.filter((c) => c.date.startDate === today);
  const thisWeekend = concerts.filter(
    (c) => c.date.startDate >= weekendStart && c.date.startDate <= weekendEnd
  );
  const thisMonth = concerts.filter(
    (c) => c.date.startDate >= today && c.date.startDate <= monthEnd
  );
  const thisWeek = concerts.filter(
    (c) => {
      const d = new Date(c.date.startDate);
      const now = new Date();
      const diff = Math.round((d.getTime() - now.getTime()) / 86400000);
      return diff >= 0 && diff < 7;
    }
  ).slice(0, 8);

  const topVenues = Object.values(venues)
    .sort((a, b) => b.upcomingEventsCount - a.upcomingEventsCount)
    .slice(0, 6);

  const comingUp = concerts
    .filter((c) => c.date.startDate > today)
    .slice(0, 6);

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4">
        {/* Hero - asymmetric, strong typography */}
        <section className="py-16 md:py-24 border-b border-border">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-primary leading-none">
                Bangkok<br />
                Concerts
              </h1>
            </div>
            <div className="md:col-span-5 flex flex-col justify-end">
              <p className="text-lg text-text-secondary leading-relaxed max-w-sm">
                Your guide to {concerts.length}+ upcoming shows across IMPACT Arena, livehouses, and clubs.
              </p>
              <div className="mt-6">
                <Link
                  href="/concerts"
                  className="inline-flex items-center gap-2 bg-text-primary text-white px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-text-secondary"
                >
                  Browse All
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick filters - horizontal, minimal */}
        <section className="py-6 border-b border-border">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">When:</span>
            <QuickFilterChip label={`Tonight (${tonight.length})`} href="/concerts?when=tonight" />
            <QuickFilterChip label={`Weekend (${thisWeekend.length})`} href="/concerts?when=weekend" />
            <QuickFilterChip label={`Month (${thisMonth.length})`} href="/concerts?when=month" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Genre:</span>
            <QuickFilterChip label="Pop" href="/concerts?genre=pop" />
            <QuickFilterChip label="Rock" href="/concerts?genre=rock" />
            <QuickFilterChip label="Electronic" href="/concerts?genre=electronic" />
            <QuickFilterChip label="Jazz" href="/concerts?genre=jazz" />
            <QuickFilterChip label="Hip-Hop" href="/concerts?genre=hip-hop" />
            <QuickFilterChip label="Indie" href="/concerts?genre=indie" />
          </div>
        </section>

        {/* This week */}
        <section className="py-12 md:py-16">
          <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
            <h2 className="text-3xl font-bold text-text-primary">This Week</h2>
            <Link
              href="/concerts"
              className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary uppercase tracking-wide"
            >
              See all <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {thisWeek.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                venue={venues[event.venueId]}
              />
            ))}
          </div>
        </section>

        {/* Top venues */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="mb-8 flex items-end justify-between border-b border-border pb-4">
            <h2 className="text-3xl font-bold text-text-primary">Venues</h2>
            <Link
              href="/venues"
              className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary uppercase tracking-wide"
            >
              All venues <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 bg-border">
            {topVenues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="group flex items-center gap-4 bg-background p-5 transition-colors hover:bg-surface"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-surface border border-border">
                  <MapPin className="h-5 w-5 text-text-secondary" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-text-primary">
                    {venue.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {venue.upcomingEventsCount} upcoming
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming up next */}
        <section className="py-12 md:py-16 border-t border-border">
          <div className="mb-8 border-b border-border pb-4">
            <h2 className="text-3xl font-bold text-text-primary">Coming Up Next</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {comingUp.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                venue={venues[event.venueId]}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 mt-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-sm font-bold text-text-primary uppercase tracking-wide">Live / BKK</p>
              <p className="mt-2 text-sm text-text-secondary">
                Bangkok concert guide for expats & locals.
              </p>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-xs text-text-tertiary uppercase tracking-wide">
                Data aggregated daily from Thai ticketing platforms.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function QuickFilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="border border-border px-3 py-1.5 text-xs font-medium text-text-secondary uppercase tracking-wide transition-colors hover:border-text-primary hover:text-text-primary"
    >
      {label}
    </Link>
  );
}
