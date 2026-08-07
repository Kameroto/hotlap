import {
  Badge,
} from "@/components/ui/badge";

import {
  cn,
} from "@/lib/utils";

type SectionHeadingProps = {
  badge?: string;

  title: string;

  subtitle?: string;

  align?:
    | "left"
    | "center";

  className?: string;
};

export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  const isCentered =
    align === "center";

  return (
    <div
      className={cn(
        isCentered &&
          "mx-auto text-center",
        className,
      )}
    >
      {badge && (
        <Badge
          variant="outline"
          className="mb-5 rounded-full border-primary/35 bg-primary/8 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-primary shadow-none hover:bg-primary/12"
        >
          {badge}
        </Badge>
      )}

      <h2 className="hotlap-heading text-3xl text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg",

            isCentered &&
              "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}