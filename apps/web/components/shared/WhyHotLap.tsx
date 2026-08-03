import { Truck, Wrench, Trophy, Flag } from "lucide-react";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import FeatureCard from "@/components/ui/FeatureCard";

const features = [
  {
    icon: <Truck size={28} />,
    title: "Fast Delivery",
    description: "Quick and reliable shipping across India.",
  },
  {
    icon: <Wrench size={28} />,
    title: "Genuine Spare Parts",
    description: "Authentic replacement parts for long-lasting performance.",
  },
  {
    icon: <Trophy size={28} />,
    title: "Premium RC Brands",
    description: "Carefully selected RC cars and accessories from trusted brands.",
  },
  {
    icon: <Flag size={28} />,
    title: "RC Events",
    description: "Join exciting races, meetups, and community events.",
  },
];

export default function WhyHotLap() {
  return (
    <Section>
      <Container>
        <SectionHeading
          badge="Why HotLap"
          title="Everything an RC Enthusiast Needs"
          subtitle="From premium RC cars to spare parts and community events, HotLap is your one-stop destination."
          align="center"
        />

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}