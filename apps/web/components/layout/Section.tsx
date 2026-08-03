import { ReactNode } from "react";
import { designTokens } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function Section({
  children,
  className,
}: SectionProps) {
  return (
    <section
      className={cn(
        designTokens.spacing.section,
        className
      )}
    >
      {children}
    </section>
  );
}