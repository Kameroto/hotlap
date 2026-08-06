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
  return (
    <ol className="relative">
      {timeline.map((step, index) => {
        const isLastStep =
          index === timeline.length - 1;

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
                    ? "bg-green-500"
                    : "bg-border"
                }`}
              />
            )}

            <div
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                step.isCompleted
                  ? "border-green-500 bg-green-500 text-white"
                  : "bg-background text-muted-foreground"
              }`}
            >
              {step.isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>

            <div className="pt-1">
              <h3
                className={
                  step.isCompleted
                    ? "font-semibold"
                    : "font-semibold text-muted-foreground"
                }
              >
                {step.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>

              {step.completedAt && (
                <p className="mt-2 text-xs font-medium text-green-700">
                  {step.completedAt}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}