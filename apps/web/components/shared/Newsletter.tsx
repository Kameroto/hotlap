import Link from "next/link";

import {
  ArrowRight,
  BellRing,
  Mail,
  Sparkles,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

export default function Newsletter() {
  return (
    <Section className="relative overflow-hidden bg-[#090b0d]">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101316] px-6 py-10 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-[-60%] right-[-10%] size-[420px] rounded-full bg-primary/[0.09] blur-[110px]" />

            <div className="absolute bottom-[-80%] left-[15%] size-[360px] rounded-full bg-primary/[0.045] blur-[110px]" />

            <div className="absolute inset-0 opacity-[0.12] hotlap-grid-background" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-primary">
                <BellRing className="size-3.5" />

                HotLap Updates
              </div>

              <h2 className="hotlap-heading mt-6 text-3xl text-foreground sm:text-4xl lg:text-5xl">
                Stay Close to the
                <span className="text-primary">
                  {" "}
                  Action.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Product launches,
                beginner guides, RC
                events, tuning advice
                and community updates
                will eventually land
                directly in your inbox.
              </p>

              <div className="hotlap-supporting-text mt-7 inline-flex items-center gap-2 font-semibold text-muted-foreground">
                <Mail className="size-4 text-primary" />

                Newsletter subscriptions
                are coming soon.
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/products"
                className={cn(
                  buttonVariants({
                    size:
                      "xl",
                  }),
                  "group",
                )}
              >
                Explore HotLap

                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register"
                className={cn(
                  buttonVariants({
                    variant:
                      "outline",
                    size:
                      "xl",
                  }),
                  "border-white/15",
                )}
              >
                <Sparkles className="size-4 text-primary" />

                Create Account
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
