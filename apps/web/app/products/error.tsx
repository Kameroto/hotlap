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
    <main>
      <Section>
        <Container>
          <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 px-6 py-14 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-600" />

            <h1 className="mt-5 text-3xl font-bold text-red-950">
              We couldn&apos;t load the catalogue
            </h1>

            <p className="mt-3 leading-7 text-red-900/80">
              HotLap was unable to retrieve the latest products. Please try again.
            </p>

            {process.env.NODE_ENV ===
              "development" && (
              <p className="mt-4 break-words rounded-lg bg-white/60 p-3 text-left font-mono text-xs text-red-900">
                {error.message}
              </p>
            )}

            <Button
              type="button"
              size="lg"
              onClick={
                reset
              }
              className="mt-7"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}