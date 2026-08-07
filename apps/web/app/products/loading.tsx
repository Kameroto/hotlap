import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function ProductsLoading() {
  return (
    <main>
      <Section>
        <Container>
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-muted" />

            <div className="mt-5 h-12 max-w-xl rounded bg-muted" />

            <div className="mt-4 h-5 max-w-2xl rounded bg-muted" />

            <div className="mt-12 h-12 max-w-xl rounded-xl bg-muted" />

            <div className="mt-6 flex flex-wrap gap-3">
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <div
                    key={
                      index
                    }
                    className="h-10 w-32 rounded-full bg-muted"
                  />
                ),
              )}
            </div>

            <div className="mt-8 h-16 rounded bg-muted" />

            <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 6,
              }).map(
                (_, index) => (
                  <div
                    key={
                      index
                    }
                    className="overflow-hidden rounded-2xl border"
                  >
                    <div className="aspect-square bg-muted" />

                    <div className="space-y-4 p-5">
                      <div className="h-4 w-24 rounded bg-muted" />

                      <div className="h-7 w-3/4 rounded bg-muted" />

                      <div className="h-4 w-full rounded bg-muted" />

                      <div className="h-4 w-2/3 rounded bg-muted" />

                      <div className="h-10 w-full rounded bg-muted" />
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