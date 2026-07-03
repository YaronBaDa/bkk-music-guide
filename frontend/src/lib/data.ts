import { promises as fs } from "fs";
import path from "path";

export interface Concert {
  id: string;
  title: string;
  date: {
    startDate: string;
    endDate: string | null;
    doorTime: string | null;
    dateStatus: string;
    recurrence: string | null;
  };
  venueId: string;
  artists: string[];
  lineup: Array<{
    artistId: string;
    billing: string;
    setTime: string | null;
  }>;
  genres: string[];
  sceneTags: string[];
  pricing: {
    currency: string;
    fromPrice: number | null;
    toPrice: number | null;
    tiers: Array<{
      name: string;
      price: number;
      availability: string;
    }>;
    notes: string;
  };
  ticketUrl: string;
  ticketSource: string;
  images: {
    poster: string;
    banner: string | null;
    gallery: string[];
    dominantColor: string | null;
  };
  status: string;
  sourceIds: Array<{ source: string; id: string }>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    scrapedAt: string;
    isInternational: boolean;
  };
  description: string;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  address: {
    street: string;
    district: string;
    city: string;
    mapsUrl: string;
  };
  transport: {
    bts: Array<{ station: string; line: string; walkingMinutes: number }>;
    mrt: Array<{ station: string; line: string; walkingMinutes: number }>;
    notes: string;
  };
  description: string;
  capacity: number | null;
  amenities: string[];
  images: {
    hero: string | null;
    gallery: string[];
    mapEmbed: string | null;
  };
  rating: {
    score: number | null;
    reviewCount: number;
    source: string;
  };
  contact: {
    website: string;
    phone: string;
    instagram: string;
    facebook: string;
  };
  upcomingEventsCount: number;
  pastEventsCount: number;
  tags: string[];
}

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

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatPrice(price: number | null, currency = "THB"): string {
  if (price == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function relativeDate(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Tonight";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  return formatDate(dateStr);
}
