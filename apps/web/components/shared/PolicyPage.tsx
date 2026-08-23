import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export type PolicySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: PolicySection[];
  closing?: {
    title: string;
    description: string;
    href: string;
    label: string;
  };
};

export default function PolicyPage({
  eyebrow,
  title,
  introduction,
  sections,
  closing,
}: PolicyPageProps) {
  return (
    <main className="overflow-x-clip bg-[#080a0c]">
      <Section className="relative border-b border-white/8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background"
        />

        <Container>
          <header className="relative max-w-3xl py-4 sm:py-8">
            <p className="hotlap-kicker">
              {eyebrow}
            </p>

            <h1 className="hotlap-heading mt-5 break-words text-4xl text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {introduction}
            </p>
          </header>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-4xl space-y-5">
            {sections.map(
              (section) => (
                <section
                  key={section.title}
                  className="rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.2)] sm:p-7 lg:p-8"
                >
                  <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {section.title}
                  </h2>

                  <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                    {section.paragraphs.map(
                      (paragraph) => (
                        <p key={paragraph}>
                          {paragraph}
                        </p>
                      ),
                    )}

                    {section.bullets && (
                      <ul className="space-y-3 pl-5">
                        {section.bullets.map(
                          (item) => (
                            <li
                              key={item}
                              className="list-disc pl-1 marker:text-primary"
                            >
                              {item}
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </div>
                </section>
              ),
            )}

            {closing && (
              <aside className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-5 sm:p-7">
                <h2 className="text-xl font-bold text-foreground">
                  {closing.title}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {closing.description}
                </p>

                <Link
                  href={closing.href}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                >
                  {closing.label}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                  />
                </Link>
              </aside>
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
