import {
  Truck,
  Zap,
} from "lucide-react";

import type {
  FieldError,
  UseFormRegister,
} from "react-hook-form";

import type { CheckoutFormValues } from "@/lib/checkout-schema";
import { formatCurrency } from "@/lib/format-currency";
import { getShippingMethods } from "@/lib/shipping";

type ShippingMethodSelectorProps = {
  subtotal: number;
  register: UseFormRegister<CheckoutFormValues>;
  error?: FieldError;
};

export default function ShippingMethodSelector({
  subtotal,
  register,
  error,
}: ShippingMethodSelectorProps) {
  const shippingMethods =
    getShippingMethods(subtotal);

  return (
    <section className="rounded-2xl border p-6">
      <h2 className="text-2xl font-semibold">
        Shipping Method
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Select the delivery option that works
        best for you.
      </p>

      <div className="mt-6 space-y-4">
        {shippingMethods.map((method) => {
          const Icon =
            method.id === "express"
              ? Zap
              : Truck;

          return (
            <label
              key={method.id}
              className="flex cursor-pointer gap-4 rounded-xl border p-4 transition has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="radio"
                value={method.id}
                className="mt-1"
                {...register("shippingMethod")}
              />

              <Icon className="mt-0.5 h-5 w-5 shrink-0" />

              <span className="flex flex-1 justify-between gap-4">
                <span>
                  <span className="block font-semibold">
                    {method.name}
                  </span>

                  <span className="mt-1 block text-sm text-muted-foreground">
                    {method.estimatedDelivery}
                  </span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    {method.description}
                  </span>
                </span>

                <span
                  className={
                    method.cost === 0
                      ? "font-semibold text-green-700"
                      : "font-semibold"
                  }
                >
                  {method.cost === 0
                    ? "Free"
                    : formatCurrency(
                        method.cost,
                        "INR",
                      )}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {error?.message && (
        <p className="mt-2 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </section>
  );
}