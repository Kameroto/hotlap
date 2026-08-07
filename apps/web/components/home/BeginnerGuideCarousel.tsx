"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BatteryCharging,
  Gauge,
  Map,
  Mountain,
  PackageCheck,
  Radio,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  ToyBrick,
  TrendingUp,
  UserRound,
  Wrench,
  Zap,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

const slides = [
  {
    id: "grade",
    eyebrow: "01 · RC Basics",
    title:
      "Hobby Grade vs Toy Grade",
    description:
      "Understand what separates a real hobby RC platform from a basic toy before you spend your money.",
  },
  {
    id: "scale",
    eyebrow: "02 · Understanding Size",
    title:
      "What Does Scale Mean in RC?",
    description:
      "RC scale tells you how large a model is compared with the full-size vehicle it represents.",
  },
  {
    id: "first-rc",
    eyebrow: "03 · Buyer Guide",
    title:
      "How to Choose Your First RC Car",
    description:
      "Start with how and where you want to drive, then choose the platform that fits your experience and budget.",
  },
] as const;

export default function BeginnerGuideCarousel() {
  const scrollContainerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const [
    activeSlide,
    setActiveSlide,
  ] = useState(0);

  function goToSlide(
    index: number,
  ) {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const nextIndex =
      Math.max(
        0,
        Math.min(
          index,
          slides.length - 1,
        ),
      );

    const slide =
      container.children[
        nextIndex
      ] as HTMLElement | undefined;

    slide?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });

    setActiveSlide(
      nextIndex,
    );
  }

  function handleScroll() {
    const container =
      scrollContainerRef.current;

    if (
      !container ||
      container.clientWidth === 0
    ) {
      return;
    }

    const nextIndex =
      Math.round(
        container.scrollLeft /
          container.clientWidth,
      );

    const normalizedIndex =
      Math.max(
        0,
        Math.min(
          nextIndex,
          slides.length - 1,
        ),
      );

    if (
      normalizedIndex !==
      activeSlide
    ) {
      setActiveSlide(
        normalizedIndex,
      );
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-white/8 bg-[#090b0d] py-16 md:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-80 w-[70%] -translate-x-1/2 rounded-full bg-primary/[0.035] blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.12] hotlap-grid-background" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="hotlap-kicker">
              New to RC?
            </p>

            <h2 className="hotlap-heading mt-4 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Start smarter.
              <span className="text-primary">
                {" "}
                Drive better.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              A three-minute introduction
              to the things every
              first-time RC buyer should
              understand before choosing a
              car.
            </p>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() =>
                goToSlide(
                  activeSlide - 1,
                )
              }
              disabled={
                activeSlide === 0
              }
              aria-label="Previous beginner guide"
              className="flex size-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.025] text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/8 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                goToSlide(
                  activeSlide + 1,
                )
              }
              disabled={
                activeSlide ===
                slides.length - 1
              }
              aria-label="Next beginner guide"
              className="flex size-11 items-center justify-center rounded-lg border border-white/12 bg-white/[0.025] text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary/8 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <div
          ref={
            scrollContainerRef
          }
          onScroll={
            handleScroll
          }
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="w-full shrink-0 snap-start">
            <HobbyVsToySlide />
          </div>

          <div className="w-full shrink-0 snap-start">
            <ScaleSlide />
          </div>

          <div className="w-full shrink-0 snap-start">
            <ChooseFirstRcSlide />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          {slides.map(
            (
              slide,
              index,
            ) => {
              const isActive =
                activeSlide === index;

              return (
                <button
                  key={
                    slide.id
                  }
                  type="button"
                  onClick={() =>
                    goToSlide(
                      index,
                    )
                  }
                  aria-label={`Show ${slide.title}`}
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    isActive
                      ? "w-8 bg-primary shadow-[0_0_12px_rgba(255,106,0,0.45)]"
                      : "w-2 bg-white/20 hover:bg-white/40",
                  )}
                />
              );
            },
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground md:hidden">
          Swipe to explore
        </p>
      </div>
    </section>
  );
}

function SlideShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <article className="relative min-h-[640px] overflow-hidden rounded-2xl border border-white/10 bg-[#101316] shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:min-h-[600px]">
      <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/[0.055] blur-[100px]" />

      <div className="relative flex min-h-[inherit] flex-col p-5 sm:p-7 lg:p-9">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-primary">
            {eyebrow}
          </p>

          <h3 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-foreground sm:text-3xl lg:text-4xl">
            {title}
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        <div className="my-8 flex flex-1 items-center">
          {children}
        </div>

        <div className="border-t border-white/8 pt-6">
          {footer}
        </div>
      </div>
    </article>
  );
}

function HobbyVsToySlide() {
  const comparisonRows = [
    {
      icon: Gauge,
      label:
        "Performance",
      hobby:
        "Higher speed, better control",
      toy:
        "Lower speed, basic control",
    },
    {
      icon: ShieldCheck,
      label:
        "Durability",
      hobby:
        "Designed for repeated hard use",
      toy:
        "Built mainly for casual play",
    },
    {
      icon: Wrench,
      label:
        "Repairability",
      hobby:
        "Replace individual parts",
      toy:
        "Often replaced instead of repaired",
    },
    {
      icon: Settings,
      label:
        "Upgradeability",
      hobby:
        "Motors, suspension, tyres and more",
      toy:
        "Very limited upgrades",
    },
    {
      icon: TrendingUp,
      label:
        "Long-term Value",
      hobby:
        "Higher entry price, longer ownership",
      toy:
        "Cheaper initially, limited lifespan",
    },
  ];

  return (
    <SlideShell
      eyebrow="01 · RC Basics"
      title="Hobby Grade vs Toy Grade"
      description="They may look similar on a shelf, but they are designed for very different ownership experiences."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products?category=rc-cars"
            className={cn(
              buttonVariants({
                size: "lg",
              }),
              "group sm:min-w-[220px]",
            )}
          >
            Buy Your First RC Car

            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/products"
            className={cn(
              buttonVariants({
                variant:
                  "outline",
                size:
                  "lg",
              }),
              "sm:min-w-[140px]",
            )}
          >
            Learn More
          </Link>
        </div>
      }
    >
      <div className="w-full">
        <div className="mb-4 grid grid-cols-[0.7fr_1fr_1fr] gap-2 text-xs font-bold uppercase tracking-[0.12em] sm:grid-cols-[0.8fr_1fr_1fr]">
          <span />

          <div className="rounded-lg border border-primary/30 bg-primary/8 px-3 py-3 text-center text-primary">
            Hobby Grade
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.025] px-3 py-3 text-center text-muted-foreground">
            Toy Grade
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          {comparisonRows.map(
            ({
              icon: Icon,
              label,
              hobby,
              toy,
            }) => (
              <div
                key={
                  label
                }
                className="grid grid-cols-[0.7fr_1fr_1fr] gap-2 border-b border-white/8 p-3 last:border-b-0 sm:grid-cols-[0.8fr_1fr_1fr] sm:p-4"
              >
                <div className="flex items-start gap-2 text-xs font-semibold text-foreground sm:text-sm">
                  <Icon className="mt-0.5 hidden size-4 shrink-0 text-primary sm:block" />

                  {label}
                </div>

                <p className="text-xs leading-5 text-foreground/90 sm:text-sm">
                  {hobby}
                </p>

                <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                  {toy}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </SlideShell>
  );
}

function ScaleSlide() {
  const scales = [
    {
      scale:
        "1/64",
      label:
        "Pocket Size",
      description:
        "Tiny models suited to collecting and very small indoor spaces.",
      width:
        "w-20",
      iconSize:
        "size-7",
    },
    {
      scale:
        "1/16",
      label:
        "Balanced",
      description:
        "Compact enough to carry easily while still delivering real performance.",
      width:
        "w-32",
      iconSize:
        "size-10",
    },
    {
      scale:
        "1/10",
      label:
        "Full Hobby Experience",
      description:
        "A popular hobby size with strong performance, presence and parts support.",
      width:
        "w-44",
      iconSize:
        "size-14",
    },
  ];

  return (
    <SlideShell
      eyebrow="02 · Understanding Size"
      title="What Does Scale Mean in RC?"
      description="A 1/10 RC car is approximately one tenth the size of the real vehicle. A smaller second number means a larger model."
      footer={
        <Link
          href="/products?category=rc-cars"
          className={cn(
            buttonVariants({
              size: "lg",
            }),
            "group w-full sm:w-auto sm:min-w-[190px]",
          )}
        >
          Buy Now

          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      }
    >
      <div className="grid w-full gap-4 lg:grid-cols-3">
        {scales.map(
          (
            scale,
            index,
          ) => (
            <div
              key={
                scale.scale
              }
              className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:border-primary/35 hover:bg-primary/[0.035]"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black tracking-[-0.04em] text-primary">
                  {
                    scale.scale
                  }
                </span>

                <span className="text-xs font-bold uppercase tracking-[0.13em] text-muted-foreground">
                  Scale
                </span>
              </div>

              <div className="flex flex-1 items-center justify-center py-7">
                <div
                  className={cn(
                    "relative flex h-20 items-center justify-center transition-transform duration-500 group-hover:scale-105",
                    scale.width,
                  )}
                >
                  <div className="absolute bottom-2 h-3 w-full rounded-full bg-black/80 blur-md" />

                  <div className="relative flex h-12 w-full items-center justify-center rounded-[45%_55%_28%_30%] border border-white/12 bg-[linear-gradient(145deg,#262b30,#0b0d0f)]">
                    <div className="absolute top-2 left-[28%] h-4 w-[40%] rounded-t-full border border-white/10 bg-[#111519]" />

                    <div className="absolute top-[55%] left-[10%] h-1.5 w-[70%] bg-primary" />

                    <div
                      className={cn(
                        "absolute -bottom-3 left-[8%] rounded-full border-4 border-[#050607] bg-[#20252a]",
                        scale.iconSize,
                      )}
                    />

                    <div
                      className={cn(
                        "absolute -right-[2%] -bottom-3 rounded-full border-4 border-[#050607] bg-[#20252a]",
                        scale.iconSize,
                      )}
                    />
                  </div>
                </div>
              </div>

              <p className="text-base font-semibold text-foreground">
                {scale.label}
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {
                  scale.description
                }
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary/8">
                  {
                    index ===
                    0 ? (
                      <ToyBrick className="size-3.5" />
                    ) : index ===
                      1 ? (
                      <Radio className="size-3.5" />
                    ) : (
                      <Zap className="size-3.5" />
                    )
                  }
                </span>

                Bigger scale as you move right
              </div>
            </div>
          ),
        )}
      </div>
    </SlideShell>
  );
}

function ChooseFirstRcSlide() {
  const steps = [
    {
      number:
        "01",
      icon:
        UserRound,
      title:
        "Know Your Experience",
      description:
        "Beginners should prioritise predictable handling, durability and readily available parts.",
    },
    {
      number:
        "02",
      icon:
        Mountain,
      title:
        "Choose Your Terrain",
      description:
        "Road, dirt, grass, jumps or crawling all favour different vehicle types.",
    },
    {
      number:
        "03",
      icon:
        Banknote,
      title:
        "Set Your Budget",
      description:
        "Include batteries, chargers and common replacement parts—not only the car.",
    },
    {
      number:
        "04",
      icon:
        PackageCheck,
      title:
        "Think Long Term",
      description:
        "Choose a platform with upgrades, replacement parts and room to improve.",
    },
  ];

  return (
    <SlideShell
      eyebrow="03 · Buyer Guide"
      title="How to Choose Your First RC Car"
      description="The best first RC is not necessarily the fastest one. Choose the car that fits where, how and how often you plan to drive."
      footer={
        <Link
          href="/products?category=rc-cars"
          className={cn(
            buttonVariants({
              size: "lg",
            }),
            "group w-full sm:w-auto sm:min-w-[230px]",
          )}
        >
          Buy Your First RC Car

          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      }
    >
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="relative">
          <div className="absolute top-8 bottom-8 left-5 w-px bg-gradient-to-b from-primary via-primary/50 to-white/10" />

          <div className="space-y-3">
            {steps.map(
              ({
                number,
                icon: Icon,
                title,
                description,
              }) => (
                <div
                  key={
                    number
                  }
                  className="relative grid grid-cols-[2.5rem_1fr] gap-4 rounded-xl border border-white/8 bg-black/15 p-4 transition-all duration-300 hover:border-primary/25 hover:bg-primary/[0.025]"
                >
                  <div className="relative z-10 flex size-10 items-center justify-center rounded-full border border-primary/35 bg-[#101316] text-xs font-black text-primary">
                    {number}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" />

                      <p className="text-sm font-semibold text-foreground">
                        {title}
                      </p>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {
                        description
                      }
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="hidden min-h-[390px] items-center justify-center rounded-xl border border-white/8 bg-[radial-gradient(circle_at_50%_45%,rgba(255,106,0,0.12),transparent_48%)] lg:flex">
          <div className="relative">
            <div className="absolute -inset-16 rounded-full border border-primary/10" />

            <div className="absolute -inset-28 rounded-full border border-white/5" />

            <div className="relative flex size-44 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.055] shadow-[0_0_70px_rgba(255,106,0,0.08)]">
              <Target className="size-16 text-primary" />
            </div>

            <div className="absolute -top-6 -right-14 flex items-center gap-2 rounded-lg border border-white/10 bg-[#15191d] px-3 py-2 text-xs text-muted-foreground">
              <Map className="size-4 text-primary" />

              Terrain
            </div>

            <div className="absolute -bottom-6 -left-16 flex items-center gap-2 rounded-lg border border-white/10 bg-[#15191d] px-3 py-2 text-xs text-muted-foreground">
              <BatteryCharging className="size-4 text-primary" />

              Running Cost
            </div>

            <div className="absolute -right-20 bottom-10 flex items-center gap-2 rounded-lg border border-white/10 bg-[#15191d] px-3 py-2 text-xs text-muted-foreground">
              <Route className="size-4 text-primary" />

              Use Case
            </div>

            <div className="absolute -top-5 -left-16 flex items-center gap-2 rounded-lg border border-white/10 bg-[#15191d] px-3 py-2 text-xs text-muted-foreground">
              <Sparkles className="size-4 text-primary" />

              Experience
            </div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}