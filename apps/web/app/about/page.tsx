import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  Boxes,
  CarFront,
  HeartHandshake,
  PackageSearch,
  Printer,
  Shirt,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About HotLap",
  description:
    "Learn about HotLap, a specialist Indian store for RC cars, parts, merchandise, and 3D-printed RC accessories.",
};

const focusAreas = [
  {
    icon: CarFront,
    title: "RC cars",
    description:
      "Ready-to-run vehicles and enthusiast-focused RC platforms for different ways of enjoying the hobby.",
  },
  {
    icon: Boxes,
    title: "Parts & accessories",
    description:
      "Practical products for maintaining, powering, setting up, and enjoying RC vehicles.",
  },
  {
    icon: Shirt,
    title: "RC merchandise",
    description:
      "Merchandise that reflects the culture and enthusiasm around remote-controlled performance.",
  },
  {
    icon: Printer,
    title: "3D-printed accessories",
    description:
      "Useful RC-focused accessories made possible through adaptable 3D-printed designs.",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-x-clip bg-[#080a0c]">
      <Section className="relative border-b border-white/8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.09] hotlap-grid-background"
        />

        <Container>
          <div className="relative grid gap-10 py-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-10">
            <header className="max-w-3xl">
              <p className="hotlap-kicker">
                About HotLap
              </p>

              <h1 className="hotlap-heading mt-5 break-words text-4xl text-foreground sm:text-5xl lg:text-6xl">
                Built Around the RC Hobby.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                HotLap is a specialist Indian e-commerce store focused on RC cars and the products that support the hobby—from parts and accessories to merchandise and 3D-printed additions.
              </p>
            </header>

            <div className="rounded-2xl border border-primary/25 bg-primary/[0.055] p-6 sm:p-7">
              <PackageSearch
                aria-hidden="true"
                className="size-7 text-primary"
              />
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
                A focused selection
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                The storefront is designed to make RC products easier to discover, compare, save, and order without the complexity of a marketplace.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <section aria-labelledby="about-focus-heading">
            <div className="max-w-2xl">
              <p className="hotlap-kicker">
                What We Focus On
              </p>
              <h2
                id="about-focus-heading"
                className="hotlap-heading mt-4 text-3xl text-foreground sm:text-4xl"
              >
                Products for every part of the run.
              </h2>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {focusAreas.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/10 bg-[#101316] p-6 sm:p-7"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-6 text-primary"
                  />
                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-6 rounded-3xl border border-white/10 bg-[#101316] p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:p-10">
            <span className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <HeartHandshake
                aria-hidden="true"
                className="size-6"
              />
            </span>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Helpful by direction
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                HotLap is being shaped around clear product information, practical customer support, and a broader direction that keeps RC enthusiasm and community at its centre.
              </p>
            </div>

            <Link
              href="/products"
              className={cn(buttonVariants({ size: "lg" }), "min-h-11")}
            >
              Browse Products
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </section>
        </Container>
      </Section>
    </main>
  );
}
