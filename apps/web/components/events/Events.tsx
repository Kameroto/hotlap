import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

export default function Events() {
  return (
    <Section>
      <Container>
        <h2 className="text-3xl font-bold">RC Events</h2>

        <p className="mt-4 text-gray-600">
          Upcoming RC racing events will appear here.
        </p>
      </Container>
    </Section>
  );
}