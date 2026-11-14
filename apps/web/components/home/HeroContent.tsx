import CTAButtons from "@/components/shared/CTAButtons";

export default function HeroContent() {
  return (
    <div className="relative z-10 order-1 min-w-0 max-w-full lg:order-none lg:max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] text-primary shadow-[0_0_30px_rgba(255,106,0,0.07)]">
        <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(255,106,0,0.8)]" />

        RC Cars · Batteries · Accessories
      </div>

      <h1 className="mt-5 max-w-full text-[clamp(3.25rem,7vw,6.8rem)] font-black uppercase leading-[0.84] tracking-[-0.06em] text-foreground sm:mt-7 lg:max-w-[820px]">
        RC Starts
        <span className="mt-2 block text-primary">
          Here.
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:mt-8 sm:text-lg sm:leading-8">
        Explore RC cars, batteries
        and 3D-printed accessories
        in the current HotLap
        catalogue.
      </p>

      <CTAButtons className="mt-6 sm:mt-9" />
    </div>
  );
}
