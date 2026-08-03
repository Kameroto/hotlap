import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function FeaturedProducts() {
  return (
    <Section>
      <Container>
        <h2 className="text-3xl font-bold">Featured Products</h2>

        <p className="mt-4 text-gray-600">
          Our best-selling RC cars will appear here.
        </p>
      </Container>
    </Section>
  );
}