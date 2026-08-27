"use client";

import Image from "next/image";

import {
  CalendarDays,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  cn,
} from "@/lib/utils";

type EventImageProps = {
  imageUrl: string | null;
  imageAlt: string | null;
  title: string;
  priority?: boolean;
  className?: string;
};

export default function EventImage({
  imageUrl,
  imageAlt,
  title,
  priority = false,
  className,
}: EventImageProps) {
  const [hasFailed, setHasFailed] =
    useState(false);

  const canShowImage =
    Boolean(imageUrl) &&
    !hasFailed;

  const alt = imageAlt ?? "";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[#0c0f12]",
        className,
      )}
    >
      {canShowImage && imageUrl ? (
        imageUrl.startsWith("/") ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            className="object-cover"
            onError={() =>
              setHasFailed(true)
            }
          />
        ) : (
          // Remote hosts are intentionally not allowlisted globally without verified requirements.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
            onError={() =>
              setHasFailed(true)
            }
          />
        )
      ) : (
        <div className="flex h-full min-h-48 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,106,0,0.10),transparent_65%)] p-8">
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/8 text-primary">
              <CalendarDays
                aria-hidden="true"
                className="size-6"
              />
            </span>

            <p className="hotlap-supporting-text mt-4 font-bold uppercase tracking-[0.16em] text-muted-foreground">
              HotLap Event
            </p>

            <span className="sr-only">
              No image is available for {title}.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
