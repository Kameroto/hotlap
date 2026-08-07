import {
  PackageCheck,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import Container from "@/components/layout/Container";

import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

const trustItems = [
  {
    icon: Wrench,
    title:
      "Performance Focused",
    description:
      "Products chosen for enthusiasts",
  },

  {
    icon: ShieldCheck,
    title:
      "Genuine Quality",
    description:
      "No toy-grade compromises",
  },

  {
    icon: Truck,
    title:
      "Pan-India Delivery",
    description:
      "Built to reach racers everywhere",
  },

  {
    icon: PackageCheck,
    title:
      "Parts Support",
    description:
      "Keep your RC running longer",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/8 bg-[#080a0c]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-52 left-[5%] size-[500px] rounded-full bg-primary/[0.055] blur-[130px]" />

        <div className="absolute top-1/2 right-[-15%] size-[560px] rounded-full bg-primary/[0.035] blur-[150px]" />

        <div className="absolute inset-0 opacity-[0.2] hotlap-grid-background" />
      </div>

      <Container>
        <div className="relative grid min-h-[calc(100vh-72px)] items-center gap-14 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-20 xl:gap-16">
          <HeroContent />

          <HeroImage />
        </div>
      </Container>

      <div className="relative border-t border-white/8 bg-black/25">
        <Container>
          <div className="grid grid-cols-1 divide-y divide-white/8 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
            {trustItems.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <div
                  key={
                    title
                  }
                  className="group flex items-center gap-4 px-2 py-5 sm:px-5 lg:border-r lg:border-white/8 lg:px-6 lg:last:border-r-0"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/12">
                    <Icon className="size-[1.15rem]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {
                        description
                      }
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </Container>
      </div>
    </section>
  );
}