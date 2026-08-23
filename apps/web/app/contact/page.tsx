import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  CircleHelp,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Find the currently available ways to review HotLap account, order, shipping, and store information.",
};

const supportPaths = [
  {
    icon: Package,
    title: "Existing orders",
    description:
      "Signed-in customers can review order status, delivery details, payment status, and purchased items from order history.",
    href: "/account/orders",
    label: "View your orders",
  },
  {
    icon: UserRound,
    title: "Account & addresses",
    description:
      "Review your profile or update saved delivery addresses directly from your customer account.",
    href: "/account",
    label: "Open your account",
  },
  {
    icon: MapPin,
    title: "Shipping information",
    description:
      "Read the currently supported shipping methods and charges before placing an order.",
    href: "/shipping",
    label: "Read shipping policy",
  },
];

export default function ContactPage() {
  return (
    <main className="overflow-x-clip bg-[#080a0c]">
      <Section className="relative border-b border-white/8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background"
        />
        <Container>
          <header className="relative max-w-3xl py-4 sm:py-8">
            <p className="hotlap-kicker">Contact & Support</p>
            <h1 className="hotlap-heading mt-5 break-words text-4xl text-foreground sm:text-5xl lg:text-6xl">
              Start with the information already available.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              HotLap does not yet publish a verified customer-support email address, phone number, or contact form. The routes below provide the support information currently available in the storefront.
            </p>
          </header>
        </Container>
      </Section>

      <Section>
        <Container>
          <section
            aria-labelledby="support-options-heading"
            className="mx-auto max-w-5xl"
          >
            <h2 id="support-options-heading" className="sr-only">
              Support options
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {supportPaths.map(({ icon: Icon, title, description, href, label }) => (
                <article
                  key={title}
                  className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#101316] p-6 sm:p-7"
                >
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                    {description}
                  </p>
                  <Link
                    href={href}
                    className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                  >
                    {label}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </article>
              ))}
            </div>

            <aside className="mt-6 rounded-2xl border border-primary/25 bg-primary/[0.06] p-6 sm:p-7">
              <CircleHelp aria-hidden="true" className="size-6 text-primary" />
              <h2 className="mt-4 text-xl font-bold text-foreground">
                Direct contact channel not yet published
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                A verified support channel must be established by HotLap before direct enquiries can be accepted here. This page does not submit messages or create support requests.
              </p>
            </aside>
          </section>
        </Container>
      </Section>
    </main>
  );
}
