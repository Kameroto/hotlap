import {
  EventStatus,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";

import type {
  EventQuery,
} from "./event-query-schema.js";

import {
  toEventResponse,
  type EventResponse,
} from "./event-response.js";

const PUBLIC_EVENT_STATUSES = [
  EventStatus.PUBLISHED,
  EventStatus.CANCELLED,
];

export async function listEvents(
  query: EventQuery,
  evaluatedAt = new Date(),
): Promise<EventResponse[]> {
  const events =
    await prisma.event.findMany({
      where: {
        status: {
          in: PUBLIC_EVENT_STATUSES,
        },

        startsAt:
          query.scope === "upcoming"
            ? {
                gte: evaluatedAt,
              }
            : {
                lt: evaluatedAt,
              },
      },

      orderBy: {
        startsAt:
          query.scope === "upcoming"
            ? "asc"
            : "desc",
      },
    });

  return events.map(toEventResponse);
}

export async function findPublicEventBySlug(
  slug: string,
): Promise<EventResponse | null> {
  const event =
    await prisma.event.findFirst({
      where: {
        slug,

        status: {
          in: PUBLIC_EVENT_STATUSES,
        },
      },
    });

  return event
    ? toEventResponse(event)
    : null;
}
