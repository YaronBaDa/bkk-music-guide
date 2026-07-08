import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { Concert, Venue, formatPrice, relativeDate } from "@/lib/types";

interface EventCardProps {
  event: Concert;
  venue?: Venue;
  size?: "sm" | "md";
  showNewBadge?: boolean;
}

export default function EventCard({ event, venue, size = "md", showNewBadge = false }: EventCardProps) {
  const isSm = size === "sm";

  return (
    <Link
      href={`/concerts/${event.id}`}
      className="group block overflow-hidden border border-border bg-background transition-colors hover:border-text-primary"
    >
      <div className={`relative overflow-hidden ${isSm ? "aspect-[3/4]" : "aspect-[2/3]"}`}>
        {showNewBadge && (
          <div className="absolute left-2 top-2 z-10 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            New
          </div>
        )}
        {event.images.poster ? (
          <Image
            src={event.images.poster}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <Calendar className="h-8 w-8 text-text-tertiary" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className={`${isSm ? "p-3" : "p-4"}`}>
        <h3
          className={`font-semibold leading-snug text-text-primary ${
            isSm ? "text-sm" : "text-base"
          }`}
        >
          {event.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary uppercase tracking-wide">
          <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span>{relativeDate(event.date.startDate)}</span>
        </div>

        {venue && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{venue.name}</span>
          </div>
        )}

        {event.pricing.fromPrice != null && (
          <div className="mt-3 text-xs font-semibold text-text-primary uppercase tracking-wide">
            from {formatPrice(event.pricing.fromPrice)}
          </div>
        )}
      </div>
    </Link>
  );
}
