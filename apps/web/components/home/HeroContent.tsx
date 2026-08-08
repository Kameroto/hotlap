import CTAButtons from "@/components/shared/CTAButtons";

export default function HeroContent() {
  return (
    <div className="relative z-10 max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] text-primary shadow-[0_0_30px_rgba(255,106,0,0.07)]">
        <span className="size-1.5 rounded-full bg-primary shadow-[0_0_12px_rgba(255,106,0,0.8)]" />

        Precision. Performance.
        Passion.
      </div>

      <h1 className="mt-7 max-w-[920px] text-[clamp(3.4rem,8vw,7.6rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] text-foreground">
        Built to
        <span className="block">
          Race.
        </span>

        <span className="mt-2 block text-primary">
          Made to Win.
        </span>
      </h1>

      <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        Premium RC cars,
        performance parts and
        accessories for people who
        expect more from every
        corner, jump and straight.
      </p>

      <CTAButtons className="mt-9" />
    </div>
  );
}