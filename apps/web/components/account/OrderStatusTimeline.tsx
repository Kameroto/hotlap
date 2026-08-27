import {
  Check,
  Circle,
} from "lucide-react";

import type {
  OrderTimelineStep,
} from "@/types/order";

type OrderStatusTimelineProps = {
  timeline: OrderTimelineStep[];
};

export default function OrderStatusTimeline({
  timeline,
}: OrderStatusTimelineProps) {
  const currentStepIndex =
    timeline.reduce(
      (latestIndex, step, index) =>
        step.isCompleted
          ? index
          : latestIndex,
      -1,
    );

  return (
    <ol
      className="relative"
      aria-label="Order progress"
    >
      {timeline.map((step, index) => {
        const isLastStep =
          index === timeline.length - 1;

        const isCurrentStep =
          index === currentStepIndex;

        const stageLabel =
          isCurrentStep
            ? "Current stage"
            : step.isCompleted
              ? "Completed stage"
              : "Upcoming stage";

        return (
          <li
            key={step.status}
            className="relative flex gap-5 pb-8 last:pb-0"
          >
            {!isLastStep && (
              <span
                aria-hidden="true"
                className={`absolute top-9 left-[17px] h-[calc(100%-1.25rem)] w-px ${
                  step.isCompleted
                    ? "bg-[var(--hotlap-success)]"
                    : "bg-border"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                step.isCompleted
                  ? "border-[var(--hotlap-success)] bg-[var(--hotlap-success)] text-black"
                  : "border-border bg-background text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              {step.isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>

            <div
              className="min-w-0 pt-1"
              aria-current={
                isCurrentStep
                  ? "step"
                  : undefined
              }
            >
              <p
                className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${
                  isCurrentStep
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {stageLabel}
              </p>

              <h3
                className={`mt-1 ${
                  step.isCompleted
                    ? "font-semibold text-foreground"
                    : "font-semibold text-muted-foreground"
                }`}
              >
                {step.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>

              {step.completedAt && (
                <p className="hotlap-supporting-text mt-2 font-medium text-[var(--hotlap-success)]">
                  {formatTimelineDate(
                    step.completedAt,
                  )}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function formatTimelineDate(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(date));
}
