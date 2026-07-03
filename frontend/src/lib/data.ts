import { promises as fs } from "fs";
import path from "path";
import { Concert, Venue, formatDate, formatPrice, relativeDate } from "./types";

export type { Concert, Venue };
export { formatDate, formatPrice, relativeDate };

const dataDir = path.join(process.cwd(), "public", "data");

export async function getConcerts(): Promise<Concert[]> {
  const file = path.join(dataDir, "concerts.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Concert[];
}

export async function getVenues(): Promise<Record<string, Venue>> {
  const file = path.join(dataDir, "venues.json");
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as Record<string, Venue>;
}
