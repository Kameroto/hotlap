"use client";

import ProductDetailError from "@/components/products/ProductDetailError";

export default function ProductError({ reset }: { reset: () => void }) {
  return <ProductDetailError reset={reset} />;
}
