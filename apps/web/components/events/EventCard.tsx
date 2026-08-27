import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  MapPin,
} from "lucide-react";

import EventImage from "@/components/events/EventImage";

import {
  formatEventSchedule,
  getEventExcerpt,
} from "@/lib/events";

import type {
  Event,
} from "@/types/event";

export default function EventCard({
  event,
}: {
  event: Event;
}) {
  const isCancelled =
    event.status === "CANCELLED";

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101316] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-colors hover:border-primary/35 motion-reduce:transition-none">
      <EventImage
        imageUrl={event.imageUrl}
        imageAlt={event.imageAlt}
        title={event.title}
        className="aspect-[16/10] border-b border-white/8"
      />

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        {isCancelled && (
          <p className="w-fit rounded-full border border-destructive/35 bg-destructive/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-destructive">
            Cancelled
          </p>
        )}

        <h2 className="mt-4 break-words text-2xl font-bold tracking-[-0.03em] text-foreground">
          <Link
            href={`/events/${event.slug}`}
            className="rounded-sm outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-[#101316] motion-reduce:transition-none"
          >
            {event.title}
          </Link>
        </h2>

        <dl className="mt-5 space-y-3 text-sm text-muted-foreground">
          <div className="flex min-w-0 gap-3">
            <Clock3
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <div>
              <dt className="sr-only">
                Date and time
              </dt>
              <dd className="break-words leading-6">
                {formatEventSchedule(
                  event.startsAt,
                  event.endsAt,
                )}
              </dd>
            </div>
          </div>

          <div className="flex min-w-0 gap-3">
            <MapPin
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <div className="min-w-0">
              <dt className="sr-only">
                Location
              </dt>
              <dd className="break-words leading-6">
                {event.location}
              </dd>
            </div>
          </div>
        </dl>

        <p className="mt-5 flex-1 break-words text-sm leading-7 text-muted-foreground">
          {getEventExcerpt(
            event.description,
          )}
        </p>

        <Link
          href={`/events/${event.slug}`}
          className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg text-sm font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#101316] motion-reduce:transition-none"
        >
          View event details
          <ArrowRight
            aria-hidden="true"
            className="size-4"
          />
        </Link>
      </div>
    </article>
  );
}
