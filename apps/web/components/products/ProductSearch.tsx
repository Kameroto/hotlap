"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
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

          router.replace(
            queryString
              ? `${pathname}?${queryString}`
              : pathname,
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
    <div className="relative max-w-xl">
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
        placeholder="Search by product, brand, category, or SKU"
        className="h-12 w-full rounded-xl border bg-background pr-4 pl-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}