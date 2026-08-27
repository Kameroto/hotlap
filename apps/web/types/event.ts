export type EventStatus =
  | "PUBLISHED"
  | "CANCELLED";

export type EventScope =
  | "upcoming"
  | "past";

export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  externalRegistrationUrl: string | null;
  status: EventStatus;
};

export type EventsResponse = {
  events: Event[];
  totalItems: number;
  scope: EventScope;
};

export type EventDetailsResponse = {
  event: Event;
};
