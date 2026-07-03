import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { getConcerts, getVenues } from "@/lib/data";
import { ArrowRight, MapPin, Music } from "lucide-react";

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
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
            Bangkok Concerts <br className="sm:hidden" />&amp; Live Music
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-text-secondary">
            Your guide to 300+ upcoming shows across IMPACT Arena, livehouses, and clubs.
            Every event links straight to the official ticket source.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/concerts"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <Music className="h-4 w-4" />
              Browse All Concerts
            </Link>
          </div>
        </section>

        {/* Quick filters */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-tertiary mr-1">When:</span>
            <QuickFilterChip label={`Tonight ${tonight.length}`} href="/concerts?when=tonight" />
            <QuickFilterChip label={`Weekend ${thisWeekend.length}`} href="/concerts?when=weekend" />
            <QuickFilterChip label={`Month ${thisMonth.length}`} href="/concerts?when=month" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-text-tertiary mr-1">Genre:</span>
            <QuickFilterChip label="Pop" href="/concerts?genre=pop" />
            <QuickFilterChip label="Rock" href="/concerts?genre=rock" />
            <QuickFilterChip label="Electronic" href="/concerts?genre=electronic" />
            <QuickFilterChip label="Jazz" href="/concerts?genre=jazz" />
            <QuickFilterChip label="K-Pop / Hip-Hop" href="/concerts?genre=hip-hop" />
            <QuickFilterChip label="Indie" href="/concerts?genre=indie" />
          </div>
        </section>

        {/* This week */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">This Week</h2>
            <Link
              href="/concerts"
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
            >
              See all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
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
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">Top Venues</h2>
            <Link
              href="/venues"
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
            >
              All venues <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topVenues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-elevated">
                  <MapPin className="h-5 w-5 text-accent" />
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
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">Coming Up Next</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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

      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-text-tertiary">
          <p>
            Live / BKK — Bangkok concert guide for expats &amp; locals.
          </p>
          <p className="mt-2">Data aggregated daily from Thai ticketing platforms.</p>
        </div>
      </footer>
    </>
  );
}

function QuickFilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-accent/30 hover:text-accent"
    >
      {label}
    </Link>
  );
}
