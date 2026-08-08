import {
  BatteryCharging,
  Box,
  Cog,
  FlaskConical,
  Gauge,
  Layers3,
  Ruler,
  Settings2,
  SlidersHorizontal,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

type ProductQuickSpecsProps = {
  specifications: Record<
    string,
    string
  >;
};

type SpecificationMetadata = {
  label: string;
  icon: LucideIcon;
};

const metadata: Record<
  string,
  SpecificationMetadata
> = {
  scale: {
    label: "Scale",
    icon: Ruler,
  },

  topSpeed: {
    label: "Top Speed",
    icon: Gauge,
  },

  motor: {
    label: "Motor",
    icon: Zap,
  },

  drivetrain: {
    label: "Drivetrain",
    icon: Cog,
  },

  chassis: {
    label: "Chassis",
    icon: Wrench,
  },

  capacity: {
    label: "Capacity",
    icon: BatteryCharging,
  },

  chemistry: {
    label: "Chemistry",
    icon: FlaskConical,
  },

  enclosure: {
    label: "Enclosure",
    icon: Box,
  },

  material: {
    label: "Material",
    icon: Layers3,
  },

  adjustment: {
    label: "Adjustment",
    icon: SlidersHorizontal,
  },
};

const preferredOrder = [
  "scale",
  "topSpeed",
  "motor",
  "drivetrain",
  "chassis",
  "capacity",
  "chemistry",
  "enclosure",
  "material",
  "adjustment",
];

function humanizeKey(
  key: string,
): string {
  return key
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /[-_]/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function ProductQuickSpecs({
  specifications,
}: ProductQuickSpecsProps) {
  const entries =
    Object.entries(
      specifications,
    )
      .filter(
        ([, value]) =>
          Boolean(
            value?.trim(),
          ),
      )
      .sort(
        (
          [firstKey],
          [secondKey],
        ) => {
          const firstIndex =
            preferredOrder.indexOf(
              firstKey,
            );

          const secondIndex =
            preferredOrder.indexOf(
              secondKey,
            );

          return (
            (firstIndex === -1
              ? 999
              : firstIndex) -
            (secondIndex === -1
              ? 999
              : secondIndex)
          );
        },
      )
      .slice(
        0,
        4,
      );

  if (
    entries.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      {entries.map(
        ([key, value]) => {
          const specification =
            metadata[key];

          const Icon =
            specification?.icon ??
            Settings2;

          return (
            <div
              key={
                key
              }
              className="rounded-xl border border-white/8 bg-black/20 p-3.5 transition-colors duration-300 hover:border-primary/25 hover:bg-primary/[0.025] sm:p-4"
            >
              <div className="flex items-center gap-2 text-primary">
                <Icon className="size-4" />

                <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {specification
                    ?.label ??
                    humanizeKey(
                      key,
                    )}
                </span>
              </div>

              <p className="mt-2 truncate text-sm font-semibold text-foreground sm:text-base">
                {value}
              </p>
            </div>
          );
        },
      )}
    </div>
  );
}