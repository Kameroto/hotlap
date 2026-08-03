import { ReactNode } from "react";
import { designTokens } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function Container({
  children,
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        designTokens.spacing.container,
        className
      )}
    >
      {children}
    </div>
  );
}