import Link from "next/link";

import {
  ArrowDownRight,
} from "lucide-react";

import Container from "@/components/layout/Container";

import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/8 bg-[#080a0c]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,106,0,0.055),transparent_34rem),radial-gradient(circle_at_88%_42%,rgba(255,106,0,0.045),transparent_36rem)]" />

        <div className="absolute inset-0 opacity-[0.16] hotlap-grid-background" />

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0c0f12]/70 to-transparent" />
      </div>

      <Container>
        <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-7 py-10 sm:gap-12 sm:py-16 lg:min-h-[calc(100svh_-_var(--hotlap-announcement-height)_-_var(--hotlap-navbar-height))] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10 lg:py-16 xl:gap-14 2xl:gap-20">
          <HeroContent />

          <HeroImage />
        </div>
      </Container>

      <div className="relative border-t border-white/8 bg-[#0b0e11]/88">
        <Container>
          <div className="flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
            <p className="hotlap-supporting-text font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              RC Cars · Batteries · 3D-Printed Accessories
            </p>

            <Link
              href="/products"
              className="group inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none"
            >
              Explore the catalogue
              <ArrowDownRight
                aria-hidden="true"
                className="size-4"
              />
            </Link>
          </div>
        </Container>
      </div>
    </section>
  );
}
