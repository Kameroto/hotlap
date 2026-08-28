"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";

import SiteOverlay from "@/components/layout/SiteOverlay";
import ProductImage from "@/components/products/ProductImage";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  getProducts,
} from "@/lib/api/client";
import {
  formatCurrency,
} from "@/lib/format-currency";
import {
  cn,
} from "@/lib/utils";

import type {
  Product,
} from "@/types/product";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

type SearchPhase =
  | "initial"
  | "hint"
  | "loading"
  | "results"
  | "empty"
  | "error";

const minimumQueryLength = 2;
const maximumQueryLength = 120;
const predictiveResultLimit = 5;
const debounceMilliseconds = 300;

export default function SearchOverlay({
  open,
  onClose,
  triggerRef,
}: SearchOverlayProps) {
  const router = useRouter();

  const [query, setQuery] =
    useState("");
  const [products, setProducts] =
    useState<Product[]>([]);
  const [phase, setPhase] =
    useState<SearchPhase>(
      "initial",
    );

  const requestGenerationRef =
    useRef(0);

  const normalizedQuery =
    query.trim();
  const queryIsMeaningful =
    normalizedQuery.length >=
    minimumQueryLength;

  useEffect(() => {
    if (
      !open ||
      !queryIsMeaningful
    ) {
      return;
    }

    const requestGeneration =
      ++requestGenerationRef.current;

    const debounceTimer =
      window.setTimeout(
        async () => {
          setPhase("loading");

          try {
            const response =
              await getProducts({
                search:
                  normalizedQuery,
                page: 1,
                pageSize:
                  predictiveResultLimit,
              });

            if (
              requestGeneration !==
              requestGenerationRef.current
            ) {
              return;
            }

            setProducts(
              response.products,
            );
            setPhase(
              response.products.length >
                0
                ? "results"
                : "empty",
            );
          } catch {
            if (
              requestGeneration !==
              requestGenerationRef.current
            ) {
              return;
            }

            setProducts([]);
            setPhase("error");
          }
        },
        debounceMilliseconds,
      );

    return () => {
      window.clearTimeout(
        debounceTimer,
      );

      requestGenerationRef.current +=
        1;
    };
  }, [
    normalizedQuery,
    open,
    queryIsMeaningful,
  ]);

  function handleQueryChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const nextQuery =
      event.target.value.slice(
        0,
        maximumQueryLength,
      );
    const nextNormalizedQuery =
      nextQuery.trim();

    setQuery(nextQuery);

    requestGenerationRef.current +=
      1;
    setProducts([]);

    if (
      nextNormalizedQuery.length <
      minimumQueryLength
    ) {
      setPhase(
        nextNormalizedQuery.length ===
          0
          ? "initial"
          : "hint",
      );
    } else {
      setPhase("loading");
    }
  }

  function clearSearch() {
    requestGenerationRef.current +=
      1;
    setQuery("");
    setProducts([]);
    setPhase("initial");
  }

  function submitSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!queryIsMeaningful) {
      setPhase(
        normalizedQuery.length === 0
          ? "initial"
          : "hint",
      );
      return;
    }

    onClose();
    router.push(
      getSearchResultsHref(
        normalizedQuery,
      ),
    );
  }

  return (
    <SiteOverlay
      id="site-search"
      open={open}
      onClose={onClose}
      triggerRef={triggerRef}
      labelledBy="site-search-title"
      containerClassName="items-start justify-center px-3 pt-3 sm:px-6 sm:pt-8"
      panelClassName="h-[calc(100dvh-1.5rem)] w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0b0e11] shadow-[0_28px_90px_rgba(0,0,0,0.58)] sm:h-auto sm:max-h-[calc(100dvh-4rem)] sm:rounded-3xl"
    >
      <div className="flex min-h-full flex-col sm:min-h-0">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7">
          <div>
            <p className="hotlap-kicker">
              Find your next build
            </p>

            <h2
              id="site-search-title"
              className="mt-1 text-2xl sm:text-3xl"
            >
              Search HotLap
            </h2>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close product search"
          >
            <X className="size-5" />
          </Button>
        </div>

        <form
          role="search"
          onSubmit={submitSearch}
          className="border-b border-white/10 px-5 py-5 sm:px-7"
        >
          <label
            htmlFor="overlay-product-search"
            className="sr-only"
          >
            Search HotLap products
          </label>

          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            />

            <input
              id="overlay-product-search"
              autoFocus
              type="search"
              value={query}
              maxLength={
                maximumQueryLength
              }
              onChange={
                handleQueryChange
              }
              placeholder="Search by product, brand or SKU..."
              className="h-14 w-full rounded-xl border border-white/12 bg-white/[0.045] pr-14 pl-12 text-base font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/25 motion-reduce:transition-none"
            />

            {query.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear product search"
                className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:max-h-[60dvh] sm:px-7">
          <SearchState
            phase={phase}
            products={products}
            query={normalizedQuery}
            onNavigate={onClose}
          />
        </div>

        {queryIsMeaningful && (
          <div className="border-t border-white/10 px-5 py-4 sm:px-7">
            <Link
              href={getSearchResultsHref(
                normalizedQuery,
              )}
              onClick={onClose}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                }),
                "w-full whitespace-normal text-center",
              )}
            >
              View all results for “
              {normalizedQuery}”
            </Link>
          </div>
        )}
      </div>
    </SiteOverlay>
  );
}

function SearchState({
  phase,
  products,
  query,
  onNavigate,
}: {
  phase: SearchPhase;
  products: Product[];
  query: string;
  onNavigate: () => void;
}) {
  if (phase === "loading") {
    return (
      <SearchMessage
        status
        icon={
          <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
        }
        title="Searching products"
        detail={`Looking for “${query}”…`}
      />
    );
  }

  if (phase === "error") {
    return (
      <SearchMessage
        status
        title="Search is temporarily unavailable"
        detail="Please edit your search to try again, or view all products."
      />
    );
  }

  if (phase === "empty") {
    return (
      <SearchMessage
        status
        title="No products found"
        detail={`No current products match “${query}”. Try a broader product name, brand or SKU.`}
      />
    );
  }

  if (phase === "hint") {
    return (
      <SearchMessage
        title="Keep typing"
        detail="Enter at least 2 characters to search the HotLap catalogue."
      />
    );
  }

  if (phase === "results") {
    return (
      <div>
        <p
          className="hotlap-supporting-text mb-3 font-semibold text-muted-foreground"
          aria-live="polite"
        >
          {products.length} predictive
          {products.length === 1
            ? " result"
            : " results"}
        </p>

        <div className="grid gap-2">
          {products.map(
            (product) => {
              const primaryImage =
                product.images.find(
                  (image) =>
                    image.isPrimary,
                ) ??
                product.images[0];

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onNavigate}
                  className="group flex min-w-0 items-center gap-4 rounded-xl border border-white/8 bg-white/[0.025] p-3 outline-none transition-colors hover:border-primary/35 hover:bg-white/[0.045] focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-white/8 bg-[#080a0c] sm:size-24">
                    <ProductImage
                      src={
                        primaryImage?.url
                      }
                      alt={
                        primaryImage?.alt ??
                        product.name
                      }
                      variant="thumbnail"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="hotlap-supporting-text text-primary">
                      {product.brand} ·{" "}
                      {product.category.name}
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-base leading-snug">
                      {product.name}
                    </h3>

                    <p className="mt-2 font-semibold text-foreground">
                      {formatCurrency(
                        product.price,
                        "INR",
                      )}
                    </p>
                  </div>
                </Link>
              );
            },
          )}
        </div>
      </div>
    );
  }

  return (
    <SearchMessage
      title="Search the catalogue"
      detail="Enter a product name, brand or SKU to see matching products."
    />
  );
}

function SearchMessage({
  icon,
  title,
  detail,
  status = false,
}: {
  icon?: React.ReactNode;
  title: string;
  detail: string;
  status?: boolean;
}) {
  return (
    <div
      role={status ? "status" : undefined}
      className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.018] px-5 py-8 text-center"
    >
      {icon && (
        <span className="mb-3 text-primary">
          {icon}
        </span>
      )}

      <p className="font-semibold text-foreground">
        {title}
      </p>

      <p className="mt-1 max-w-lg text-sm text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}

function getSearchResultsHref(
  query: string,
): string {
  const searchParams =
    new URLSearchParams({
      search: query,
    });

  return `/products?${searchParams.toString()}`;
}
