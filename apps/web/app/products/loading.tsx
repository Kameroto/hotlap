import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function ProductsLoading() {
  return (
    <main className="bg-[#080a0c]">
      <Section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] hotlap-grid-background" />

        <Container>
          <div className="relative animate-pulse motion-reduce:animate-none">
            <div className="h-4 w-32 rounded bg-primary/15" />

            <div className="mt-5 h-12 max-w-xl rounded bg-white/8" />

            <div className="mt-4 h-5 max-w-2xl rounded bg-white/6" />

            <div className="mt-10 rounded-2xl border border-white/8 bg-[#101316]/70 p-4 sm:p-5">
              <div className="h-12 max-w-xl rounded-xl bg-white/7" />

              <div className="mt-7 flex gap-2.5 overflow-hidden">
                {Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <div
                      key={
                        index
                      }
                      className="h-10 w-32 shrink-0 rounded-full bg-white/7"
                    />
                  ),
                )}
              </div>
            </div>

            <div className="mt-7 h-16 border-y border-white/8 bg-white/[0.025]" />

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 6,
              }).map(
                (_, index) => (
                  <div
                    key={
                      index
                    }
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#101316]"
                  >
                    <div className="aspect-square bg-white/6" />

                    <div className="space-y-4 p-5">
                      <div className="h-4 w-24 rounded bg-primary/12" />

                      <div className="h-7 w-3/4 rounded bg-white/8" />

                      <div className="h-4 w-full rounded bg-white/6" />

                      <div className="h-4 w-2/3 rounded bg-white/6" />

                      <div className="mt-8 h-10 w-full rounded-lg bg-white/8" />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
