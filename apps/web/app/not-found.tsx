import Link from "next/link";

import {
  ArrowLeft,
  Home,
  SearchX,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-dashed px-6 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-9 w-9 text-muted-foreground" />
        </div>

        <p className="mt-8 text-[0.875rem] font-semibold uppercase tracking-[0.2em] text-red-600">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          This page took a wrong turn
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
          The page or product you requested does not
          exist, may have moved, or is no longer
          available.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className={buttonVariants()}
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Products
          </Link>

          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant: "outline",
              }),
            )}
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
