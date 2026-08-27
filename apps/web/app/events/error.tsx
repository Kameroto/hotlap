"use client";

import Link from "next/link";

import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

export default function EventsError({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <main className="bg-[#080a0c]">
      <Section>
        <Container>
          <div
            role="alert"
            className="mx-auto max-w-xl rounded-3xl border border-destructive/35 bg-[#101316] px-6 py-14 text-center shadow-[0_24px_70px_rgba(0,0,0,0.3)]"
          >
            <span className="mx-auto flex size-14 items-center justify-center rounded-xl border border-destructive/35 bg-destructive/10 text-destructive">
              <AlertTriangle
                aria-hidden="true"
                className="size-6"
              />
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
              Events could not be loaded
            </h1>

            <p className="mt-3 leading-7 text-muted-foreground">
              HotLap could not retrieve the published event information. This is not an empty event schedule.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                onClick={reset}
              >
                <RefreshCw
                  aria-hidden="true"
                  className="size-4"
                />
                Try Again
              </Button>

              <Link
                href="/products"
                className={cn(
                  buttonVariants({
                    variant: "outline",
                    size: "lg",
                  }),
                )}
              >
                Browse Products
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
