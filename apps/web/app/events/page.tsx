import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  CalendarDays,
  CarFront,
  History,
} from "lucide-react";

import EventCard from "@/components/events/EventCard";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  getEvents,
} from "@/lib/api/events";

import {
  cn,
} from "@/lib/utils";

import type {
  EventScope,
} from "@/types/event";

type EventsPageProps = {
  searchParams: Promise<{
    scope?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Events",
  description:
    "View published HotLap RC events and experiences, including their dates, times, locations, and event details.",
  alternates: {
    canonical: "/events",
  },
};

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: EventsPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const scope: EventScope =
    resolvedSearchParams.scope ===
    "past"
      ? "past"
      : "upcoming";

  const response =
    await getEvents(scope);

  return (
    <main className="overflow-x-clip bg-[#080a0c]">
      <Section className="relative border-b border-white/8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.09] hotlap-grid-background"
        />

        <Container>
          <header className="relative max-w-3xl py-4 sm:py-8">
            <p className="hotlap-kicker">
              HotLap Events
            </p>

            <h1 className="hotlap-heading mt-5 break-words text-4xl text-foreground sm:text-5xl lg:text-6xl">
              RC experiences, published when they&apos;re ready.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Find the dates, locations, and details for HotLap RC events that are currently published.
            </p>
          </header>
        </Container>
      </Section>

      <Section>
        <Container>
          <nav
            aria-label="Event timeline"
            className="flex w-full max-w-md rounded-xl border border-white/10 bg-[#101316] p-1"
          >
            <ScopeLink
              href="/events"
              label="Upcoming"
              isActive={
                scope === "upcoming"
              }
            />

            <ScopeLink
              href="/events?scope=past"
              label="Past"
              isActive={
                scope === "past"
              }
            />
          </nav>

          {response.events.length > 0 ? (
            <section
              aria-labelledby="event-results-heading"
              className="mt-9"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="hotlap-kicker">
                    {scope === "upcoming"
                      ? "Published Schedule"
                      : "Event Archive"}
                  </p>

                  <h2
                    id="event-results-heading"
                    className="mt-3 text-3xl font-bold tracking-tight text-foreground"
                  >
                    {scope === "upcoming"
                      ? "Upcoming events"
                      : "Past events"}
                  </h2>
                </div>

                <p className="text-sm text-muted-foreground">
                  {response.totalItems}{" "}
                  {response.totalItems === 1
                    ? "event"
                    : "events"}
                </p>
              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {response.events.map(
                  (event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ),
                )}
              </div>
            </section>
          ) : (
            <EmptyEventsState
              scope={scope}
            />
          )}
        </Container>
      </Section>
    </main>
  );
}

function ScopeLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={
        isActive ? "page" : undefined
      }
      className={cn(
        "flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#101316] motion-reduce:transition-none",
        isActive
          ? "bg-primary text-primary-foreground shadow-[0_8px_25px_rgba(255,106,0,0.18)]"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      {label}
      {isActive && (
        <span className="sr-only">
          {" "}(current view)
        </span>
      )}
    </Link>
  );
}

function EmptyEventsState({
  scope,
}: {
  scope: EventScope;
}) {
  const isUpcoming =
    scope === "upcoming";

  return (
    <section
      aria-labelledby="empty-events-heading"
      className="mt-9 rounded-3xl border border-dashed border-white/15 bg-[#101316]/75 px-5 py-14 text-center sm:px-8 sm:py-16"
    >
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/8 text-primary">
        {isUpcoming ? (
          <CalendarDays
            aria-hidden="true"
            className="size-7"
          />
        ) : (
          <History
            aria-hidden="true"
            className="size-7"
          />
        )}
      </span>

      <h2
        id="empty-events-heading"
        className="mx-auto mt-6 max-w-xl break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
      >
        {isUpcoming
          ? "No upcoming events are published right now."
          : "No past events are currently published."}
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
        {isUpcoming
          ? "There are no current event details to display. You can browse HotLap products or review the published event archive."
          : "HotLap does not currently have published event history to show here."}
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/products"
          className={cn(
            buttonVariants({
              size: "lg",
            }),
            "min-h-11",
          )}
        >
          <CarFront
            aria-hidden="true"
            className="size-4"
          />
          Browse RC Cars
        </Link>

        <Link
          href={
            isUpcoming
              ? "/events?scope=past"
              : "/events"
          }
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "lg",
            }),
            "min-h-11",
          )}
        >
          {isUpcoming
            ? "View Past Events"
            : "View Upcoming Events"}
        </Link>
      </div>
    </section>
  );
}
