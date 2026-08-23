import {
  CalendarDays,
  Flag,
  GraduationCap,
  Radio,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

import SectionHeading from "@/components/ui/SectionHeading";

const eventFormats: {
  icon: LucideIcon;
  kicker: string;
  title: string;
  description: string;
}[] = [
  {
    icon: Flag,
    kicker:
      "Race",
    title:
      "Track Days",
    description:
      "Friendly sessions designed around driving, tuning, learning, and enjoying RC performance with other enthusiasts.",
  },
  {
    icon: Users,
    kicker:
      "Community",
    title:
      "RC Meetups",
    description:
      "Meet other builders and drivers, discover different RC platforms, and exchange practical ownership knowledge.",
  },
  {
    icon: GraduationCap,
    kicker:
      "Learn",
    title:
      "Beginner Sessions",
    description:
      "Approachable sessions intended to help newcomers understand setup, maintenance, batteries, driving, and upgrades.",
  },
];

export default function Events() {
  return (
    <div
      id="events"
      className="scroll-mt-24"
    >
      <Section className="relative overflow-hidden border-b border-white/8 bg-[#080a0c]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-[450px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.035] blur-[150px]" />
        </div>

      <Container>
        <div className="relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              badge="HotLap Community"
              title="RC Is Better When It’s Shared"
              subtitle="HotLap events will bring drivers, builders, beginners, and enthusiasts together beyond the online store."
            />

            <div className="flex w-fit items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.055] px-4 py-3">
              <CalendarDays className="size-5 text-primary" />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-primary">
                  Event Calendar
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {eventFormats.map(
              ({
                icon: Icon,
                kicker,
                title,
                description,
              }) => (
                <article
                  key={
                    title
                  }
                  className="group relative min-h-[330px] overflow-hidden rounded-2xl border border-white/10 bg-[#101316] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] sm:p-7"
                >
                  <div className="absolute -top-20 -right-20 size-48 rounded-full bg-primary/[0.045] blur-3xl transition-colors duration-500 group-hover:bg-primary/[0.08]" />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
                        <Icon className="size-5" />
                      </div>

                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {kicker}
                      </span>
                    </div>

                    <div className="mt-20">
                      <h3 className="text-2xl font-bold tracking-[-0.03em] text-foreground">
                        {title}
                      </h3>

                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {
                          description
                        }
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/8 pt-6">
            <CommunityPoint
              icon={
                Trophy
              }
              label="Competition"
            />

            <CommunityPoint
              icon={
                Radio
              }
              label="Setup & tuning"
            />

            <CommunityPoint
              icon={
                Users
              }
              label="Community"
            />
          </div>
        </div>
        </Container>
      </Section>
    </div>
  );
}

function CommunityPoint({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
      <Icon className="size-4 text-primary" />

      {label}
    </div>
  );
}
