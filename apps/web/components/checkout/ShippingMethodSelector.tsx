import type {
  FieldError,
  UseFormRegister,
} from "react-hook-form";

import {
  Check,
  Truck,
} from "lucide-react";

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

import {
  cn,
} from "@/lib/utils";

type ShippingMethodSelectorProps = {
  subtotal: number;
  selectedMethod: ShippingMethodId;
  onMethodChange: (
    method: ShippingMethodId,
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
    <fieldset
      aria-describedby={
        error
          ? "checkout-shipping-error"
          : "checkout-shipping-description"
      }
      className="rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.2)] sm:p-6"
    >
      <legend className="sr-only">
        Shipping Method
      </legend>

      <p className="hotlap-kicker">
        Shipping
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        Shipping Method
      </h2>
      <p
        id="checkout-shipping-description"
        className="mt-2 text-sm leading-6 text-muted-foreground"
      >
        Select a server-priced shipping option for this order.
      </p>

      <div className="mt-6 grid gap-3">
        {shippingMethods.map(
          (method) => {
            const isSelected =
              selectedMethod ===
              method.id;

            return (
              <label
                key={method.id}
                className={cn(
                  "flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background motion-reduce:transition-none",
                  isSelected
                    ? "border-primary/55 bg-primary/[0.07]"
                    : "border-white/10 bg-black/15 hover:border-white/20",
                )}
              >
                <input
                  type="radio"
                  value={method.id}
                  checked={isSelected}
                  name={
                    shippingRegistration.name
                  }
                  ref={
                    shippingRegistration.ref
                  }
                  onBlur={
                    shippingRegistration.onBlur
                  }
                  onChange={(event) => {
                    void shippingRegistration.onChange(
                      event,
                    );
                    onMethodChange(
                      event.target.value as ShippingMethodId,
                    );
                  }}
                  className="sr-only"
                />

                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-primary">
                  {isSelected ? (
                    <Check className="size-4" />
                  ) : (
                    <Truck className="size-4" />
                  )}
                </span>

                <span className="flex min-w-0 flex-1 justify-between gap-4">
                  <span>
                    <span className="block font-semibold text-foreground">
                      {method.name}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                      {method.description}
                    </span>
                  </span>

                  <span className="shrink-0 font-bold text-foreground">
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
          },
        )}
      </div>

      {error?.message && (
        <p
          id="checkout-shipping-error"
          role="alert"
          className="mt-3 text-sm text-destructive"
        >
          {error.message}
        </p>
      )}
    </fieldset>
  );
}
