import {
  Button as ButtonPrimitive,
} from "@base-ui/react/button";

import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import {
  cn,
} from "@/lib/utils";

const buttonVariants =
  cva(
    [
      "group/button",
      "inline-flex",
      "shrink-0",
      "items-center",
      "justify-center",
      "whitespace-nowrap",
      "rounded-lg",
      "border",
      "text-sm",
      "font-semibold",
      "tracking-[-0.01em]",
      "outline-none",
      "select-none",
      "transition-all",
      "duration-300",
      "ease-[cubic-bezier(0.22,1,0.36,1)]",

      "focus-visible:ring-2",
      "focus-visible:ring-primary/50",
      "focus-visible:ring-offset-2",
      "focus-visible:ring-offset-background",

      "disabled:pointer-events-none",
      "disabled:opacity-45",

      "[&_svg]:pointer-events-none",
      "[&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:size-4",
    ].join(" "),
    {
      variants: {
        variant: {
          default: [
            "border-primary",
            "bg-primary",
            "text-primary-foreground",
            "shadow-[0_8px_30px_rgba(255,106,0,0.14)]",

            "hover:-translate-y-0.5",
            "hover:bg-[#ff7a00]",
            "hover:shadow-[0_12px_34px_rgba(255,106,0,0.28)]",

            "active:translate-y-0",
          ].join(" "),

          outline: [
            "border-border",
            "bg-transparent",
            "text-foreground",

            "hover:-translate-y-0.5",
            "hover:border-primary/70",
            "hover:bg-primary/8",
            "hover:text-primary",
          ].join(" "),

          secondary: [
            "border-border",
            "bg-secondary",
            "text-secondary-foreground",

            "hover:-translate-y-0.5",
            "hover:border-primary/40",
            "hover:bg-secondary/80",
          ].join(" "),

          ghost: [
            "border-transparent",
            "bg-transparent",
            "text-muted-foreground",

            "hover:bg-white/5",
            "hover:text-foreground",
          ].join(" "),

          destructive: [
            "border-destructive/40",
            "bg-destructive/12",
            "text-destructive",

            "hover:bg-destructive/20",
          ].join(" "),

          link: [
            "border-transparent",
            "bg-transparent",
            "px-0",
            "text-primary",
            "underline-offset-4",

            "hover:underline",
          ].join(" "),
        },

        size: {
          default:
            "h-10 gap-2 px-4",

          xs:
            "h-7 gap-1.5 rounded-md px-2.5 text-xs",

          sm:
            "h-9 gap-1.5 px-3.5 text-xs",

          lg:
            "h-12 gap-2.5 px-6 text-sm",

          xl:
            "h-14 gap-3 px-8 text-base",

          icon:
            "size-10",

          "icon-xs":
            "size-7 rounded-md",

          "icon-sm":
            "size-9",

          "icon-lg":
            "size-12",
        },
      },

      defaultVariants: {
        variant:
          "default",

        size:
          "default",
      },
    },
  );

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props &
  VariantProps<
    typeof buttonVariants
  >) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}

export {
  Button,
  buttonVariants,
};