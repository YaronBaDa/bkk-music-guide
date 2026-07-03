import Header from "@/components/Header";
import ConcertsClient from "@/components/ConcertsClient";
import { getConcerts, getVenues } from "@/lib/data";

export const metadata = {
  title: "All Concerts — Live / BKK",
};

export default async function ConcertsPage() {
  const concerts = await getConcerts();
  const venues = await getVenues();

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">All Concerts</h1>
        <ConcertsClient concerts={concerts} venues={venues} />
      </main>
    </>
  );
}
