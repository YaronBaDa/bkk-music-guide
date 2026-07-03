import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { Concert, Venue, formatPrice, relativeDate } from "@/lib/types";

interface EventCardProps {
  event: Concert;
  venue?: Venue;
  size?: "sm" | "md";
}

export default function EventCard({ event, venue, size = "md" }: EventCardProps) {
  const isSm = size === "sm";

  return (
    <Link
      href={`/concerts/${event.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
    >
      <div className={`relative overflow-hidden ${isSm ? "aspect-[3/4]" : "aspect-[2/3]"}`}>
        {event.images.poster ? (
          <Image
            src={event.images.poster}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-elevated">
            <Calendar className="h-8 w-8 text-text-tertiary" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex flex-wrap gap-1.5">
            {event.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-3 ${isSm ? "p-2.5" : "p-3"}`}>
        <h3
          className={`font-semibold leading-snug text-text-primary line-clamp-2 ${
            isSm ? "text-sm" : "text-base"
          }`}
        >
          {event.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{relativeDate(event.date.startDate)}</span>
        </div>

        {venue && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{venue.name}</span>
          </div>
        )}

        {event.pricing.fromPrice != null && (
          <div className="mt-2 text-xs font-medium text-accent">
            from {formatPrice(event.pricing.fromPrice)}
          </div>
        )}
      </div>
    </Link>
  );
}
