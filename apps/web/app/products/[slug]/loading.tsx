import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function ProductLoading() {
  return (
    <main>
      <Section>
        <Container>
          <p role="status" className="mb-6 text-muted-foreground">Loading product details…</p>
          <div aria-hidden="true" className="grid gap-10 motion-safe:animate-pulse lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-white/8" />
            <div className="space-y-6">
              <div className="h-12 w-3/4 rounded bg-white/8" />
              <div className="h-24 rounded bg-white/8" />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
