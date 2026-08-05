import type { Metadata } from "next";

import CheckoutForm from "@/components/checkout/CheckoutForm";
import Section from "@/components/layout/Section";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your HotLap order and delivery information.",
};

export default function CheckoutPage() {
  return (
    <main>
      <Section>
        <CheckoutForm />
      </Section>
    </main>
  );
}