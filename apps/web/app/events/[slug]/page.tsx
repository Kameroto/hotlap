import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpRight,
  CarFront,
  Clock3,
  MapPin,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import EventImage from "@/components/events/EventImage";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  findEventBySlug,
  formatEventSchedule,
  getEventExcerpt,
} from "@/lib/events";

import {
  cn,
} from "@/lib/utils";

type EventDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EventDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event =
    await findEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: event.title,
    description: getEventExcerpt(
      event.description,
      155,
    ),
    alternates: {
      canonical: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { slug } = await params;
  const event =
    await findEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const isCancelled =
    event.status === "CANCELLED";

  return (
    <main className="overflow-x-clip bg-[#080a0c]">
      <section className="relative border-b border-white/8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.09] hotlap-grid-background"
        />

        <Container>
          <div className="relative py-6 sm:py-8">
            <Link
              href="/events"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <ArrowLeft
                aria-hidden="true"
                className="size-4"
              />
              Back to Events
            </Link>
          </div>
        </Container>
      </section>

      <Section className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-[-15%] size-[520px] rounded-full bg-primary/[0.035] blur-[150px]"
        />

        <Container>
          {isCancelled && (
            <aside className="relative mb-7 rounded-2xl border border-destructive/35 bg-destructive/8 px-5 py-5 sm:px-6">
              <p className="text-[0.875rem] font-bold uppercase tracking-[0.14em] text-destructive">
                Cancelled
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                This event has been cancelled. Its published details remain available for reference, but registration is not available.
              </p>
            </aside>
          )}

          <article className="relative grid min-w-0 gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-12">
            <EventImage
              imageUrl={event.imageUrl}
              imageAlt={event.imageAlt}
              title={event.title}
              priority
              className="aspect-[16/11] rounded-3xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
            />

            <div className="min-w-0">
              <p className="hotlap-kicker">
                HotLap Event
              </p>

              <h1 className="hotlap-heading mt-5 break-words text-4xl text-foreground sm:text-5xl lg:text-6xl">
                {event.title}
              </h1>

              <dl className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-[#101316] p-5 sm:p-6">
                <div className="flex min-w-0 gap-3">
                  <Clock3
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <div>
                    <dt className="hotlap-supporting-text font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Date and time
                    </dt>
                    <dd className="mt-1 break-words text-sm leading-7 text-foreground sm:text-base">
                      {formatEventSchedule(
                        event.startsAt,
                        event.endsAt,
                      )}
                    </dd>
                  </div>
                </div>

                <div className="flex min-w-0 gap-3 border-t border-white/8 pt-4">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <div className="min-w-0">
                    <dt className="hotlap-supporting-text font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Location
                    </dt>
                    <dd className="mt-1 break-words text-sm leading-7 text-foreground sm:text-base">
                      {event.location}
                    </dd>
                  </div>
                </div>
              </dl>

              {!isCancelled &&
                event.externalRegistrationUrl && (
                <a
                  href={event.externalRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({
                      size: "lg",
                    }),
                    "mt-6 min-h-11 max-w-full whitespace-normal text-center",
                  )}
                >
                  Register on external site
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4"
                  />
                  <span className="sr-only">
                    {" "}(opens in a new tab)
                  </span>
                </a>
              )}
            </div>
          </article>

          <section
            aria-labelledby="event-description-heading"
            className="relative mt-12 border-t border-white/8 pt-10 sm:mt-16 sm:pt-12"
          >
            <div className="grid min-w-0 gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12">
              <h2
                id="event-description-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Event details
              </h2>

              <p className="min-w-0 whitespace-pre-wrap break-words text-base leading-8 text-muted-foreground">
                {event.description}
              </p>
            </div>
          </section>

          <nav
            aria-label="Event page actions"
            className="relative mt-12 flex flex-col gap-3 border-t border-white/8 pt-8 sm:flex-row"
          >
            <Link
              href="/events"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                }),
              )}
            >
              <ArrowLeft
                aria-hidden="true"
                className="size-4"
              />
              Back to Events
            </Link>

            <Link
              href="/products"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                }),
              )}
            >
              <CarFront
                aria-hidden="true"
                className="size-4"
              />
              Browse Products
            </Link>
          </nav>
        </Container>
      </Section>
    </main>
  );
}
