import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";

export default function Hero() {
  return (
    <Section className="bg-gradient-to-b from-white via-gray-50 to-white">
      <Container>
        <div className="grid min-h-[80vh] items-center gap-20 lg:grid-cols-2">
          <HeroContent />
          <HeroImage />
        </div>
      </Container>
    </Section>
  );
}