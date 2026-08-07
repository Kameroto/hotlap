import type {
  FieldError,
  UseFormRegister,
} from "react-hook-form";

import {
  formatCurrency,
} from "@/lib/format-currency";

import {
  getShippingMethods,
  type ShippingMethodId,
} from "@/lib/shipping";

import type {
  CheckoutFormValues,
} from "@/lib/checkout-schema";

type ShippingMethodSelectorProps = {
  subtotal: number;

  selectedMethod:
    ShippingMethodId;

  onMethodChange: (
    method:
      ShippingMethodId,
  ) => void;

  register:
    UseFormRegister<CheckoutFormValues>;

  error?: FieldError;
};

export default function ShippingMethodSelector({
  subtotal,
  selectedMethod,
  onMethodChange,
  register,
  error,
}: ShippingMethodSelectorProps) {
  const shippingMethods =
    getShippingMethods(
      subtotal,
    );

  const shippingRegistration =
    register(
      "shippingMethod",
    );

  return (
    <section className="rounded-2xl border p-6">
      <h2 className="text-2xl font-semibold">
        Shipping Method
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Select how quickly you
        would like your order
        delivered.
      </p>

      <div className="mt-6 space-y-3">
        {shippingMethods.map(
          (method) => (
            <label
              key={method.id}
              className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
                selectedMethod ===
                method.id
                  ? "border-red-600 bg-red-50/50"
                  : "hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                value={method.id}
                checked={
                  selectedMethod ===
                  method.id
                }
                name={
                  shippingRegistration.name
                }
                ref={
                  shippingRegistration.ref
                }
                onBlur={
                  shippingRegistration.onBlur
                }
                onChange={(
                  event,
                ) => {
                  void shippingRegistration.onChange(
                    event,
                  );

                  onMethodChange(
                    event.target
                      .value as ShippingMethodId,
                  );
                }}
                className="mt-1"
              />

              <div className="flex min-w-0 flex-1 justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {
                      method.name
                    }
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {
                      method.description
                    }
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {
                      method.estimatedDelivery
                    }
                  </p>
                </div>

                <p className="shrink-0 font-semibold">
                  {method.cost ===
                  0
                    ? "FREE"
                    : formatCurrency(
                        method.cost,
                        "INR",
                      )}
                </p>
              </div>
            </label>
          ),
        )}
      </div>

      {error?.message && (
        <p className="mt-2 text-sm text-red-600">
          {error.message}
        </p>
      )}
    </section>
  );
}