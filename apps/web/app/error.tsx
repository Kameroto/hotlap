"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Home,
  RotateCcw,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-700">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Something went wrong
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          We couldn’t load this page
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
          Try loading the page again. Your cart and wishlist have been saved in
          this browser.
        </p>

        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">
            Error reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={reset}
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>

          <Link
            href="/"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}