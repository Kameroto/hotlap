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
    Array.isArray(
      resolvedSearchParams.buyNow,
    )
      ? resolvedSearchParams.buyNow[0]
      : resolvedSearchParams.buyNow;

  const directCheckoutRequested =
    typeof buyNowValue ===
      "string" &&
    buyNowValue.trim().length >
      0;

  const directProduct =
    directCheckoutRequested
      ? await findProductBySlug(
          buyNowValue.trim(),
        )
      : null;

  return (
    <main>
      <Section>
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
