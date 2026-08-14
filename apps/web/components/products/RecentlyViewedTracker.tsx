"use client";

import {
  useEffect,
} from "react";

import {
  recordRecentlyViewed,
} from "@/lib/recently-viewed";

type RecentlyViewedTrackerProps = {
  productSlug: string;
};

export default function RecentlyViewedTracker({
  productSlug,
}: RecentlyViewedTrackerProps) {
  useEffect(() => {
    recordRecentlyViewed(
      productSlug,
    );
  }, [productSlug]);

  return null;
}
