import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  cn,
} from "@/lib/utils";

type CTAButtonsProps = {
  className?: string;
};

export default function CTAButtons({
  className,
}: CTAButtonsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap",
        className,
      )}
    >
      <Link
        href="/products"
        className={cn(
          buttonVariants({
            size: "xl",
          }),
          "group min-w-[190px]",
        )}
      >
        Shop RC Cars

        <ArrowRight
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>

      <Link
        href="/#events"
        className={cn(
          buttonVariants({
            variant:
              "outline",

            size:
              "xl",
          }),
          "group min-w-[180px] border-white/18 bg-black/10 backdrop-blur-sm hover:border-primary/60 hover:bg-primary/5",
        )}
      >
        Explore Events

        <CalendarDays
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </Link>
    </div>
  );
}
