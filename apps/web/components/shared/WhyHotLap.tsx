import {
  Boxes,
  Gauge,
  Headphones,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import SectionHeading from "@/components/ui/SectionHeading";

const features: {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    number: "01",
    icon: Gauge,
    title:
      "Hobby-Grade First",
    description:
      "We focus on RC products designed for genuine performance, proper handling, repairability, and long-term enjoyment.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title:
      "Quality You Can Trust",
    description:
      "Our catalogue is built around enthusiast-grade products rather than disposable toy-grade alternatives.",
  },
  {
    number: "03",
    icon: Boxes,
    title:
      "Ownership Beyond the Box",
    description:
      "Replacement parts, batteries, accessories, and upgrade possibilities help you keep your RC running longer.",
  },
  {
    number: "04",
    icon: Headphones,
    title:
      "Built Around Enthusiasts",
    description:
      "HotLap is being built to help newcomers choose confidently while giving experienced RC owners room to go faster.",
  },
];

export default function WhyHotLap() {
  return (
    <Section className="relative overflow-hidden border-b border-white/8 bg-[#0c0f12]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] hotlap-grid-background" />

      <Container>
        <div className="relative">
          <SectionHeading
            badge="Why HotLap"
            title="More Than Just Another RC Store"
            subtitle="The best RC experience begins before the first run and continues long after the box is opened."
            align="center"
          />

          <div className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 bg-[#101316] md:grid-cols-2 lg:grid-cols-4">
            {features.map(
              ({
                number,
                icon: Icon,
                title,
                description,
              }) => (
                <article
                  key={
                    number
                  }
                  className="group relative min-h-[300px] border-b border-white/8 p-6 transition-colors duration-500 hover:bg-primary/[0.035] md:border-r md:odd:border-r lg:border-b-0 lg:last:border-r-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.15em] text-primary">
                      {number}
                    </span>

                    <div className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/[0.065] text-primary transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:shadow-[0_0_30px_rgba(255,106,0,0.10)]">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <div className="mt-16 h-[2px] w-10 bg-primary transition-all duration-500 group-hover:w-20" />

                  <h3 className="mt-6 text-xl font-bold tracking-[-0.025em] text-foreground">
                    {title}
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {
                      description
                    }
                  </p>
                </article>
              ),
            )}
          </div>

          <div className="mt-7 flex justify-center">
            <p className="hotlap-supporting-text max-w-2xl text-center font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Performance ·
              Repairability ·
              Upgradeability ·
              Community
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
