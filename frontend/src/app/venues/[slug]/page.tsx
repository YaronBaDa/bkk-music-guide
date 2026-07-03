import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { getConcerts, getVenues } from "@/lib/data";
import { MapPin, ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const venues = await getVenues();
  return Object.values(venues).map((v) => ({ slug: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const venues = await getVenues();
  const { slug } = await params;
  const venue = Object.values(venues).find((v) => v.id === slug);
  if (!venue) return {};
  return {
    title: `${venue.name} — Live / BKK`,
  };
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const concerts = await getConcerts();
  const venues = await getVenues();
  const { slug } = await params;
  const venue = Object.values(venues).find((v) => v.id === slug);
  if (!venue) notFound();

  const venueConcerts = concerts
    .filter((c) => c.venueId === venue.id)
    .sort((a, b) => a.date.startDate.localeCompare(b.date.startDate));

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/venues"
          className="mb-8 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary uppercase tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to venues
        </Link>

        <div className="border border-border p-6 md:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-surface border border-border">
              <MapPin className="h-8 w-8 text-text-secondary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
                {venue.name}
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                {venue.upcomingEventsCount} upcoming shows
                {venue.type && venue.type !== "other" && (
                  <span className="text-text-tertiary"> · {venue.type}</span>
                )}
              </p>
            </div>
          </div>

          {venue.address?.street && (
            <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
              <MapPin className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
              <span>{venue.address.street}</span>
            </div>
          )}
        </div>

        {venueConcerts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-8 text-2xl font-bold text-text-primary font-display">
              Upcoming Concerts
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {venueConcerts.map((event) => (
                <EventCard key={event.id} event={event} venue={venue} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
