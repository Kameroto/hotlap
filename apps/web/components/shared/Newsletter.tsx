import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function Newsletter() {
  return (
    <Section>
      <Container>
        <h2 className="text-3xl font-bold">Newsletter</h2>

        <p className="mt-4 text-gray-600">
          Subscribe to receive the latest RC news and offers.
        </p>
      </Container>
    </Section>
  );
}