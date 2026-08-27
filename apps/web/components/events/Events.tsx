import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CircleAlert,
} from "lucide-react";

import EventCard from "@/components/events/EventCard";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import {
  buttonVariants,
} from "@/components/ui/button";

import SectionHeading from "@/components/ui/SectionHeading";

import {
  getEvents,
} from "@/lib/api/events";

import {
  cn,
} from "@/lib/utils";

import type {
  Event,
} from "@/types/event";

const homepageEventLimit = 3;

type EventsPreview =
  | {
      status: "available";
      events: Event[];
    }
  | {
      status: "unavailable";
    };

async function getEventsPreview(): Promise<EventsPreview> {
  try {
    const response =
      await getEvents("upcoming");

    return {
      status: "available",
      events: response.events.slice(
        0,
        homepageEventLimit,
      ),
    };
  } catch {
    return {
      status: "unavailable",
    };
  }
}

export default async function Events() {
  const preview =
    await getEventsPreview();

  return (
    <div
      id="events"
      className="scroll-mt-24"
    >
      <Section className="relative overflow-hidden border-b border-white/8 bg-[#080a0c]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute top-1/2 left-1/2 h-[450px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.035] blur-[150px]" />
        </div>

        <Container>
          <div className="relative">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                badge="HotLap Events"
                title="Meet, Drive, and Learn Together"
                subtitle="Explore published HotLap RC events, with clear dates, locations, and details before you make plans."
              />

              <Link
                href="/events"
                className={cn(
                  buttonVariants({
                    variant:
                      "outline",
                    size:
                      "lg",
                  }),
                  "group w-fit shrink-0 border-white/12",
                )}
              >
                View all events

                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
            </div>

            {preview.status ===
            "unavailable" ? (
              <EventsUnavailableState />
            ) : preview.events.length >
              0 ? (
              <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                {preview.events.map(
                  (event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyEventsState />
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}

function EmptyEventsState() {
  return (
    <div className="mt-12 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
        <CalendarDays
          aria-hidden="true"
          className="size-6"
        />
      </div>

      <h3 className="mt-5 text-xl font-bold text-foreground">
        No upcoming events are currently published
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        Visit the Events page for the current HotLap schedule or explore the RC catalogue.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/events"
          className={buttonVariants({
            size: "lg",
          })}
        >
          Explore Events
        </Link>

        <Link
          href="/products"
          className={cn(
            buttonVariants({
              variant:
                "outline",
              size: "lg",
            }),
            "border-white/12",
          )}
        >
          <CarFront
            aria-hidden="true"
          />
          Browse Products
        </Link>
      </div>
    </div>
  );
}

function EventsUnavailableState() {
  return (
    <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-12 text-center sm:px-10 sm:py-16">
      <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-muted-foreground">
        <CircleAlert
          aria-hidden="true"
          className="size-6"
        />
      </div>

      <h3 className="mt-5 text-xl font-bold text-foreground">
        Events are temporarily unavailable
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        The latest event schedule could not be loaded here. You can still visit the Events page or browse the store.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/events"
          className={buttonVariants({
            size: "lg",
          })}
        >
          Visit Events
        </Link>

        <Link
          href="/products"
          className={cn(
            buttonVariants({
              variant:
                "outline",
              size: "lg",
            }),
            "border-white/12",
          )}
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
