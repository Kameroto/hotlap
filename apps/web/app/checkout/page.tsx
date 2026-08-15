import type { Metadata } from "next";

import CheckoutForm from "@/components/checkout/CheckoutForm";
import Section from "@/components/layout/Section";

import {
  findProductBySlug,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your HotLap order and delivery information.",
};

type CheckoutPageProps = {
  searchParams: Promise<{
    buyNow?:
      | string
      | string[];
  }>;
};

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const buyNowValue =
    resolvedSearchParams.buyNow;

  const directCheckoutRequested =
    buyNowValue !== undefined;

  const directProductSlug =
    typeof buyNowValue ===
      "string" &&
    buyNowValue.trim().length >
      0
      ? buyNowValue.trim()
      : null;

  const directProduct =
    directProductSlug
      ? await findProductBySlug(
          directProductSlug,
        )
      : null;

  return (
    <main className="bg-[#080a0c]">
      <Section className="relative overflow-x-clip">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />
        <div className="pointer-events-none absolute top-0 right-[-12%] size-[520px] rounded-full bg-primary/[0.04] blur-[150px]" />
        <CheckoutForm
          directCheckoutRequested={
            directCheckoutRequested
          }
          directProduct={
            directProduct
          }
        />
      </Section>
    </main>
  );
}
