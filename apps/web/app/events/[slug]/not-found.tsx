import Link from "next/link";

import {
  ArrowLeft,
  CarFront,
  CalendarX2,
} from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

export default function EventNotFound() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-[#080a0c] px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-dashed border-white/15 bg-[#101316] px-6 py-16 text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-2xl border border-primary/25 bg-primary/8 text-primary">
          <CalendarX2
            aria-hidden="true"
            className="size-9"
          />
        </span>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Event unavailable
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
          This event could not be found
        </h1>

        <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">
          The event may not exist or may no longer be publicly available.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/events"
            className={buttonVariants()}
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
              }),
            )}
          >
            <CarFront
              aria-hidden="true"
              className="size-4"
            />
            Browse Products
          </Link>
        </div>
      </div>
    </main>
  );
}
