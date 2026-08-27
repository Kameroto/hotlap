import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function EventsLoading() {
  return (
    <main
      className="overflow-x-clip bg-[#080a0c]"
      aria-busy="true"
      aria-label="Loading events"
    >
      <Section className="relative border-b border-white/8">
        <Container>
          <div className="animate-pulse py-4 motion-reduce:animate-none sm:py-8">
            <div className="h-4 w-28 rounded bg-primary/15" />
            <div className="mt-5 h-12 max-w-2xl rounded bg-white/8" />
            <div className="mt-6 h-5 max-w-xl rounded bg-white/6" />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="animate-pulse motion-reduce:animate-none">
            <div className="h-12 max-w-md rounded-xl bg-white/7" />

            <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#101316]"
                >
                  <div className="aspect-[16/10] bg-white/6" />
                  <div className="space-y-4 p-6">
                    <div className="h-7 w-3/4 rounded bg-white/8" />
                    <div className="h-4 w-full rounded bg-white/6" />
                    <div className="h-4 w-2/3 rounded bg-white/6" />
                    <div className="h-4 w-full rounded bg-white/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <span className="sr-only" role="status">
            Loading published events
          </span>
        </Container>
      </Section>
    </main>
  );
}
