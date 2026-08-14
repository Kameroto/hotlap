"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  LoaderCircle,
  Search,
} from "lucide-react";

type ProductSearchProps = {
  initialValue: string;
};

export default function ProductSearch({
  initialValue,
}: ProductSearchProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    searchValue,
    setSearchValue,
  ] = useState(
    initialValue,
  );

  const [
    searchIsPending,
    startSearchTransition,
  ] = useTransition();

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          const normalizedValue =
            searchValue.trim();

          const currentSearch =
            searchParams.get(
              "search",
            ) ?? "";

          if (
            normalizedValue ===
            currentSearch
          ) {
            return;
          }

          const nextSearchParams =
            new URLSearchParams(
              searchParams.toString(),
            );

          if (
            normalizedValue
          ) {
            nextSearchParams.set(
              "search",
              normalizedValue,
            );
          } else {
            nextSearchParams.delete(
              "search",
            );
          }

          nextSearchParams.delete(
            "page",
          );

          const queryString =
            nextSearchParams.toString();

          startSearchTransition(
            () => {
              router.replace(
                queryString
                  ? `${pathname}?${queryString}`
                  : pathname,
              );
            },
          );
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    pathname,
    router,
    searchParams,
    searchValue,
  ]);

  return (
    <div
      className="relative max-w-xl"
      aria-busy={
        searchIsPending
      }
    >
      <Search
        aria-hidden="true"
        className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground"
      />

      <label
        htmlFor="product-search"
        className="sr-only"
      >
        Search products
      </label>

      <input
        id="product-search"
        type="search"
        value={
          searchValue
        }
        onChange={(
          event,
        ) =>
          setSearchValue(
            event.target.value,
          )
        }
        placeholder="Search by product, brand, or SKU"
        className="h-12 w-full rounded-xl border border-white/10 bg-[#0b0e11] pr-12 pl-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/30 motion-reduce:transition-none"
      />

      {searchIsPending && (
        <>
          <LoaderCircle
            aria-hidden="true"
            className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-primary motion-reduce:animate-none"
          />

          <span
            className="sr-only"
            role="status"
            aria-live="polite"
          >
            Updating product results
          </span>
        </>
      )}
    </div>
  );
}
