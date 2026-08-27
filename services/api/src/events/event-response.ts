import type {
  Event,
} from "../generated/prisma/client.js";

export type EventResponse = {
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
  status: "PUBLISHED" | "CANCELLED";
};

function getSafeExternalRegistrationUrl(
  value: string | null,
): string | null {
  const containsAsciiWhitespaceOrControl =
    value
      ? Array.from(value).some(
          (character) => {
            const codePoint =
              character.codePointAt(0) ??
              0;

            return (
              codePoint <= 0x20 ||
              codePoint === 0x7f
            );
          },
        )
      : false;

  if (
    !value ||
    value !== value.trim() ||
    containsAsciiWhitespaceOrControl
  ) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

export function toEventResponse(
  event: Event,
): EventResponse {
  if (
    event.status !== "PUBLISHED" &&
    event.status !== "CANCELLED"
  ) {
    throw new Error(
      "Draft events cannot be mapped to a public response.",
    );
  }

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt.toISOString(),
    endsAt:
      event.endsAt?.toISOString() ??
      null,
    imageUrl: event.imageUrl,
    imageAlt: event.imageUrl
      ? event.imageAlt
      : null,
    externalRegistrationUrl:
      getSafeExternalRegistrationUrl(
        event.externalRegistrationUrl,
      ),
    status: event.status,
  };
}
