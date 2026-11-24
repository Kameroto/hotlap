"use client";

import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type Ref,
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

import { parseProductCatalogueQuery } from "@/lib/product-catalog-query";

export type ProductSearchHandle = {
  cancelPendingSearch: () => void;
  settleFilterNavigation: () => void;
};

type ProductSearchProps = {
  ref: Ref<ProductSearchHandle>;
  isFilterNavigationPending: () => boolean;
};

function catalogueHref(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function ProductSearch({
  ref,
  isFilterNavigationPending,
}: ProductSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const href = catalogueHref(pathname, searchParams);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");

  const [draft, setDraft] = useState<string | null>(null);
  const pendingDraft = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const revision = useRef(0);
  const readyRevision = useRef<number | null>(null);
  const submitted = useRef(new Map<string, number>());
  const lastSubmittedHref = useRef<string | null>(null);
  const committed = useRef({ href, search, category, sort, pathname, queryString });
  const [searchIsPending, startSearchTransition] = useTransition();

  const cancelTimer = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const cancelPendingSearch = useCallback(() => {
    cancelTimer();
    submitted.current.clear();
    lastSubmittedHref.current = null;
    pendingDraft.current = null;
    readyRevision.current = null;
    setDraft(null);
  }, [cancelTimer]);

  const submitSearch = useCallback(() => {
    const value = pendingDraft.current;
    if (value === null || readyRevision.current !== revision.current || isFilterNavigationPending()) return;

    const current = committed.current;
    const search = parseProductCatalogueQuery({ search: value }).search ?? "";
    if (search === current.search) {
      // Keep the draft until any earlier submission has finished.
      if (lastSubmittedHref.current === null) cancelPendingSearch();
      return;
    }

    const params = new URLSearchParams(current.queryString);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    params.delete("page");

    const nextHref = catalogueHref(current.pathname, params);
    if (lastSubmittedHref.current === nextHref) return;

    submitted.current.set(nextHref, revision.current);
    lastSubmittedHref.current = nextHref;
    startSearchTransition(() => router.replace(nextHref));
  }, [cancelPendingSearch, isFilterNavigationPending, router]);

  useImperativeHandle(ref, () => ({
    cancelPendingSearch,
    settleFilterNavigation() {
      // A filter push supersedes any search submitted against the old URL.
      submitted.current.clear();
      lastSubmittedHref.current = null;
      submitSearch();
    },
  }), [cancelPendingSearch, submitSearch]);

  const scheduleSearch = useCallback(() => {
    cancelTimer();
    const edit = revision.current;
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      readyRevision.current = edit;
      submitSearch();
    }, 350);
  }, [cancelTimer, submitSearch]);

  useLayoutEffect(() => {
    const previous = committed.current;
    if (previous.href === href) return;
    committed.current = { href, search, category, sort, pathname, queryString };

    // The parent settles the latest filter intent after this snapshot is committed.
    if (isFilterNavigationPending()) return;

    const ownRevision = submitted.current.get(href);
    if (ownRevision !== undefined && ownRevision !== revision.current) {
      // Keep the newer draft even if React renders an earlier submitted URL first.
      for (const [target, submittedRevision] of submitted.current) {
        if (submittedRevision <= ownRevision) submitted.current.delete(target);
      }
      if (lastSubmittedHref.current === href) lastSubmittedHref.current = null;
      // An edit back to the previous URL may have needed no navigation until now.
      if (lastSubmittedHref.current === null) submitSearch();
      return;
    }

    const filterChanged = previous.pathname === pathname &&
      (previous.category !== category || previous.sort !== sort);
    if (ownRevision === undefined && filterChanged && pendingDraft.current !== null) {
      // Any submission on the previous filter URL has been superseded.
      submitted.current.clear();
      lastSubmittedHref.current = null;
      submitSearch();
      return;
    }

    cancelPendingSearch();
  }, [cancelPendingSearch, category, href, isFilterNavigationPending, pathname, queryString, search, sort, submitSearch]);

  useLayoutEffect(() => cancelTimer, [cancelTimer]);

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
        value={draft ?? search}
        onChange={event => {
          const value = event.target.value;
          revision.current += 1;
          pendingDraft.current = value;
          setDraft(value);
          scheduleSearch();
        }}
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
