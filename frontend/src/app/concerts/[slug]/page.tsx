import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { getConcerts, getVenues, formatDate, formatPrice } from "@/lib/data";
import { Calendar, MapPin, ExternalLink, ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const concerts = await getConcerts();
  return concerts.map((c) => ({ slug: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const concerts = await getConcerts();
  const { slug } = await params;
  const event = concerts.find((c) => c.id === slug);
  if (!event) return {};
  return {
    title: `${event.title} — Live / BKK`,
    openGraph: {
      title: event.title,
      images: event.images.poster ? [event.images.poster] : [],
    },
  };
}

export default async function ConcertDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const concerts = await getConcerts();
  const venues = await getVenues();
  const { slug } = await params;
  const event = concerts.find((c) => c.id === slug);
  if (!event) notFound();

  const venue = venues[event.venueId];
  const related = concerts
    .filter(
      (c) =>
        c.id !== event.id &&
        (c.venueId === event.venueId || c.genres.some((g) => event.genres.includes(g)))
    )
    .slice(0, 4);

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/concerts"
          className="mb-8 inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary uppercase tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to concerts
        </Link>

        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left column */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video w-full overflow-hidden border border-border">
              {event.images.poster ? (
                <Image
                  src={event.images.poster}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface">
                  <Calendar className="h-12 w-12 text-text-tertiary" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap gap-2">
                {event.genres.map((g) => (
                  <span
                    key={g}
                    className="border border-border px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold text-text-primary leading-tight">
                {event.title}
              </h1>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
                  <span>
                    {formatDate(event.date.startDate)}
                    {event.date.doorTime && (
                      <span className="text-text-tertiary">
                        {" "}
                        · {new Date(event.date.doorTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    )}
                  </span>
                </div>
                {venue && (
                  <Link
                    href={`/venues/${venue.id}`}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
                  >
                    <MapPin className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
                    <span>{venue.name}</span>
                  </Link>
                )}
              </div>

              {event.description && (
                <div className="mt-8 text-sm leading-relaxed text-text-secondary max-w-2xl">
                  {event.description}
                </div>
              )}

              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 bg-text-primary px-6 py-3 text-sm font-semibold text-white uppercase tracking-wide transition-colors hover:bg-text-secondary"
              >
                See Tickets
                <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Right column */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="border border-border p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                Date & Time
              </h3>
              <p className="text-lg font-semibold text-text-primary">
                {formatDate(event.date.startDate)}
              </p>
              {event.date.doorTime && (
                <p className="text-sm text-text-secondary mt-1">
                  Doors: {new Date(event.date.doorTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              )}
            </div>

            {venue && (
              <div className="border border-border p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                  Venue
                </h3>
                <Link
                  href={`/venues/${venue.id}`}
                  className="block text-lg font-semibold text-text-primary hover:text-text-secondary"
                >
                  {venue.name}
                </Link>
                <p className="mt-1 text-sm text-text-secondary">
                  {venue.upcomingEventsCount} upcoming shows
                </p>
              </div>
            )}

            {event.pricing.fromPrice != null && (
              <div className="border border-border p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                  Price
                </h3>
                <p className="text-lg font-semibold text-text-primary">
                  from {formatPrice(event.pricing.fromPrice)}
                </p>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="mb-8 text-2xl font-bold text-text-primary">
              Related Shows
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {related.map((c) => (
                <EventCard key={c.id} event={c} venue={venues[c.venueId]} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
