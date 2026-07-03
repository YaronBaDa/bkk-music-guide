import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import { getConcerts, getVenues } from "@/lib/data";

export const metadata = {
  title: "All Concerts — Live / BKK",
};

export default async function ConcertsPage() {
  const concerts = await getConcerts();
  const venues = await getVenues();

  // Group by month
  const grouped: Record<string, typeof concerts> = {};
  concerts.forEach((c) => {
    const month = c.date.startDate.slice(0, 7);
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(c);
  });

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">
          All Concerts
        </h1>
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
      </main>
    </>
  );
}
