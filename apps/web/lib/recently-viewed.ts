export const RECENTLY_VIEWED_STORAGE_KEY =
  "hotlap-recently-viewed:v1";

export const RECENTLY_VIEWED_UPDATE_EVENT =
  "hotlap:recently-viewed-updated";

const STORAGE_VERSION = 1;
const HISTORY_LIMIT = 8;

export type RecentlyViewedEntry = {
  slug: string;
  viewedAt: number;
};

type RecentlyViewedStorage = {
  version: typeof STORAGE_VERSION;
  entries: RecentlyViewedEntry[];
};

function isRecentlyViewedEntry(
  value: unknown,
): value is RecentlyViewedEntry {
  return Boolean(
    value &&
      typeof value ===
        "object" &&
      "slug" in value &&
      typeof value.slug ===
        "string" &&
      value.slug.trim().length >
        0 &&
      "viewedAt" in value &&
      typeof value.viewedAt ===
        "number" &&
      Number.isFinite(
        value.viewedAt,
      ),
  );
}

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readRecentlyViewed(): RecentlyViewedEntry[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue =
      storage.getItem(
        RECENTLY_VIEWED_STORAGE_KEY,
      );

    if (!rawValue) {
      return [];
    }

    const parsedValue =
      JSON.parse(
        rawValue,
      ) as Partial<RecentlyViewedStorage>;

    if (
      parsedValue.version !==
        STORAGE_VERSION ||
      !Array.isArray(
        parsedValue.entries,
      )
    ) {
      storage.removeItem(
        RECENTLY_VIEWED_STORAGE_KEY,
      );

      return [];
    }

    const seenSlugs =
      new Set<string>();

    return parsedValue.entries
      .filter(
        isRecentlyViewedEntry,
      )
      .toSorted(
        (first, second) =>
          second.viewedAt -
          first.viewedAt,
      )
      .filter((entry) => {
        const slug =
          entry.slug.trim();

        if (
          seenSlugs.has(slug)
        ) {
          return false;
        }

        seenSlugs.add(slug);
        return true;
      })
      .slice(0, HISTORY_LIMIT);
  } catch {
    try {
      storage.removeItem(
        RECENTLY_VIEWED_STORAGE_KEY,
      );
    } catch {
      // Storage can become unavailable between reads and cleanup.
    }

    return [];
  }
}

function writeRecentlyViewed(
  entries: RecentlyViewedEntry[],
): boolean {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  const payload: RecentlyViewedStorage = {
    version: STORAGE_VERSION,
    entries,
  };

  try {
    storage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(payload),
    );

    return true;
  } catch {
    return false;
  }
}

export function recordRecentlyViewed(
  slug: string,
): void {
  const normalizedSlug =
    slug.trim();

  if (!normalizedSlug) {
    return;
  }

  const entries = [
    {
      slug: normalizedSlug,
      viewedAt: Date.now(),
    },
    ...readRecentlyViewed().filter(
      (entry) =>
        entry.slug !==
        normalizedSlug,
    ),
  ].slice(0, HISTORY_LIMIT);

  let persisted =
    writeRecentlyViewed(
      entries,
    );

  if (!persisted) {
    persisted =
      writeRecentlyViewed(
        entries.slice(
          0,
          Math.ceil(
            HISTORY_LIMIT / 2,
          ),
        ),
      );
  }

  if (persisted) {
    window.dispatchEvent(
      new Event(
        RECENTLY_VIEWED_UPDATE_EVENT,
      ),
    );
  }
}
