"use client";

import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import {
  Button,
} from "@/components/ui/button";

type ProductsErrorProps = {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
};

export default function ProductsError({
  error,
  reset,
}: ProductsErrorProps) {
  return (
    <main className="bg-[#080a0c]">
      <Section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />

        <Container>
          <div className="relative mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#101316] px-6 py-14 text-center shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
              <AlertTriangle className="size-6" />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
              We couldn&apos;t load the catalogue
            </h1>

            <p className="mt-3 leading-7 text-muted-foreground">
              HotLap was unable to retrieve the latest products. Please try again.
            </p>

            {process.env.NODE_ENV ===
              "development" && (
              <p className="mt-4 break-words rounded-lg border border-white/8 bg-black/25 p-3 text-left font-mono text-xs text-muted-foreground">
                {error.message}
              </p>
            )}

            <Button
              type="button"
              size="lg"
              onClick={
                reset
              }
              className="mt-7 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RefreshCw className="h-4 w-4 motion-reduce:animate-none" />
              Try Again
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
