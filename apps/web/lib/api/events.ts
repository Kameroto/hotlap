import {
  apiRequest,
} from "@/lib/api/client";

import type {
  EventDetailsResponse,
  EventScope,
  EventsResponse,
} from "@/types/event";

export async function getEvents(
  scope: EventScope = "upcoming",
): Promise<EventsResponse> {
  const searchParams =
    new URLSearchParams({
      scope,
    });

  return apiRequest<EventsResponse>(
    `/events?${searchParams.toString()}`,
    {},
    {
      includeAuthentication:
        false,
      retryAfterRefresh:
        false,
    },
  );
}

export async function getEventBySlug(
  slug: string,
): Promise<EventDetailsResponse> {
  return apiRequest<EventDetailsResponse>(
    `/events/${encodeURIComponent(
      slug,
    )}`,
    {},
    {
      includeAuthentication:
        false,
      retryAfterRefresh:
        false,
    },
  );
}
