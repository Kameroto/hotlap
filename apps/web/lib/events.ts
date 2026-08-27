import {
  ApiClientError,
} from "@/lib/api/client";

import {
  getEventBySlug,
} from "@/lib/api/events";

import type {
  Event,
} from "@/types/event";

const eventDateFormatter =
  new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    },
  );

const eventDateOnlyFormatter =
  new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "long",
      timeZone: "Asia/Kolkata",
    },
  );

const eventTimeOnlyFormatter =
  new Intl.DateTimeFormat(
    "en-IN",
    {
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    },
  );

function getDateKey(date: Date): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Kolkata",
      },
    ).formatToParts(date);

  return parts
    .filter((part) =>
      [
        "year",
        "month",
        "day",
      ].includes(part.type),
    )
    .map((part) => part.value)
    .join("-");
}

export function formatEventSchedule(
  startsAt: string,
  endsAt: string | null,
): string {
  const start = new Date(startsAt);

  if (!endsAt) {
    return `${eventDateFormatter.format(start)} IST`;
  }

  const end = new Date(endsAt);

  if (
    getDateKey(start) ===
    getDateKey(end)
  ) {
    return `${eventDateOnlyFormatter.format(start)}, ${eventTimeOnlyFormatter.format(start)}–${eventTimeOnlyFormatter.format(end)} IST`;
  }

  return `${eventDateFormatter.format(start)} IST – ${eventDateFormatter.format(end)} IST`;
}

export function getEventExcerpt(
  description: string,
  maximumLength = 180,
): string {
  const normalized = description
    .replace(/\s+/g, " ")
    .trim();

  if (
    normalized.length <=
    maximumLength
  ) {
    return normalized;
  }

  return `${normalized.slice(
    0,
    maximumLength - 1,
  ).trimEnd()}…`;
}

export async function findEventBySlug(
  slug: string,
): Promise<Event | null> {
  try {
    const response =
      await getEventBySlug(slug);

    return response.event;
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      error.statusCode === 404
    ) {
      return null;
    }

    throw error;
  }
}
