"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";

import {
  useForm,
  useWatch,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import Container from "@/components/layout/Container";
import ProductImage from "@/components/products/ProductImage";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import { products } from "@/data/products";

import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/checkout-schema";

import {
  formatCurrency,
} from "@/lib/format-currency";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const STANDARD_SHIPPING_COST = 0;
const EXPRESS_SHIPPING_COST = 499;

type FieldErrorMessageProps = {
  error?: FieldError;
};

function FieldErrorMessage({
  error,
}: FieldErrorMessageProps) {
  if (!error?.message) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-red-600">
      {error.message}
    </p>
  );
}

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const textareaClassName =
  "mt-2 min-h-28 w-full resize-y rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function CheckoutForm() {
  const [completedOrderNumber, setCompletedOrderNumber] =
    useState<string | null>(null);

  const items = useCartStore(
    (state) => state.items,
  );

  const hasHydrated = useCartStore(
    (state) => state.hasHydrated,
  );

  const clearCart = useCartStore(
    (state) => state.clearCart,
  );

  const {
  register,
  handleSubmit,
  control,
  formState: {
    errors,
    isSubmitting,
  },
} = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),

    defaultValues: {
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      shippingMethod: "standard",
      orderNotes: "",
      acceptTerms: false,
    },
  });

  const selectedShippingMethod = useWatch({
  control,
  name: "shippingMethod",
});

  const cartProducts = useMemo(
    () =>
      items.flatMap((cartItem) => {
        const product = products.find(
          (candidateProduct) =>
            candidateProduct.id ===
            cartItem.productId,
        );

        if (!product) {
          return [];
        }

        return [
          {
            product,
            quantity: cartItem.quantity,
          },
        ];
      }),
    [items],
  );

  const subtotal = cartProducts.reduce(
    (total, cartProduct) =>
      total +
      cartProduct.product.price *
        cartProduct.quantity,
    0,
  );

  const shippingCost =
    selectedShippingMethod === "express"
      ? EXPRESS_SHIPPING_COST
      : STANDARD_SHIPPING_COST;

  const total = subtotal + shippingCost;

  async function submitCheckout(
    values: CheckoutFormValues,
  ) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 600);
    });

    const orderNumber = `HL-${crypto
  .randomUUID()
  .replaceAll("-", "")
  .slice(0, 8)
  .toUpperCase()}`;

    console.info("Temporary checkout order", {
      orderNumber,
      customer: values,
      cartProducts,
      subtotal,
      shippingCost,
      total,
    });

    clearCart();
    setCompletedOrderNumber(orderNumber);
  }

  if (!hasHydrated) {
    return (
      <Container>
        <div className="rounded-2xl border p-10 text-center">
          <p className="text-muted-foreground">
            Loading checkout...
          </p>
        </div>
      </Container>
    );
  }

  if (completedOrderNumber) {
    return (
      <Container>
        <div className="mx-auto max-w-2xl rounded-3xl border px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Order Confirmed
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Thank you for your order
          </h1>

          <p className="mt-5 text-muted-foreground">
            Your temporary HotLap order number is:
          </p>

          <p className="mt-2 text-xl font-bold">
            {completedOrderNumber}
          </p>

          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            This is currently a frontend demonstration.
            The backend will later store the order and
            send confirmation details.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className={buttonVariants()}
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className={buttonVariants({
                variant: "outline",
              })}
            >
              Return Home
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <Container>
        <div className="rounded-3xl border border-dashed px-6 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Add products to your cart before continuing
            to checkout.
          </p>

          <Link
            href="/products"
            className={`${buttonVariants()} mt-8`}
          >
            Explore Products
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <form
        onSubmit={handleSubmit(submitCheckout)}
        noValidate
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold">
                Contact Information
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                We’ll use these details for order updates.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={inputClassName}
                    {...register("email")}
                  />

                  <FieldErrorMessage
                    error={errors.email}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium"
                  >
                    Mobile number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    className={inputClassName}
                    {...register("phone")}
                  />

                  <FieldErrorMessage
                    error={errors.phone}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold">
                Delivery Address
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium"
                  >
                    First name
                  </label>

                  <input
                    id="firstName"
                    autoComplete="given-name"
                    className={inputClassName}
                    {...register("firstName")}
                  />

                  <FieldErrorMessage
                    error={errors.firstName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium"
                  >
                    Last name
                  </label>

                  <input
                    id="lastName"
                    autoComplete="family-name"
                    className={inputClassName}
                    {...register("lastName")}
                  />

                  <FieldErrorMessage
                    error={errors.lastName}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressLine1"
                    className="text-sm font-medium"
                  >
                    Address
                  </label>

                  <input
                    id="addressLine1"
                    autoComplete="address-line1"
                    className={inputClassName}
                    {...register("addressLine1")}
                  />

                  <FieldErrorMessage
                    error={errors.addressLine1}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressLine2"
                    className="text-sm font-medium"
                  >
                    Apartment, building, landmark
                    <span className="ml-1 text-muted-foreground">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="addressLine2"
                    autoComplete="address-line2"
                    className={inputClassName}
                    {...register("addressLine2")}
                  />

                  <FieldErrorMessage
                    error={errors.addressLine2}
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="text-sm font-medium"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    autoComplete="address-level2"
                    className={inputClassName}
                    {...register("city")}
                  />

                  <FieldErrorMessage
                    error={errors.city}
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="text-sm font-medium"
                  >
                    State / Union Territory
                  </label>

                  <select
                    id="state"
                    autoComplete="address-level1"
                    className={inputClassName}
                    {...register("state")}
                  >
                    <option value="">
                      Select state
                    </option>

                    {indianStates.map((state) => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    ))}
                  </select>

                  <FieldErrorMessage
                    error={errors.state}
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="text-sm font-medium"
                  >
                    PIN code
                  </label>

                  <input
                    id="postalCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={inputClassName}
                    {...register("postalCode")}
                  />

                  <FieldErrorMessage
                    error={errors.postalCode}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold">
                Shipping Method
              </h2>

              <div className="mt-6 space-y-4">
                <label className="flex cursor-pointer gap-4 rounded-xl border p-4 transition has-checked:border-primary has-checked:bg-primary/5">
                  <input
                    type="radio"
                    value="standard"
                    className="mt-1"
                    {...register("shippingMethod")}
                  />

                  <Truck className="mt-0.5 h-5 w-5" />

                  <span className="flex flex-1 justify-between gap-4">
                    <span>
                      <span className="block font-semibold">
                        Standard Delivery
                      </span>

                      <span className="mt-1 block text-sm text-muted-foreground">
                        Estimated delivery in 4–7 business
                        days.
                      </span>
                    </span>

                    <span className="font-semibold text-green-700">
                      Free
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer gap-4 rounded-xl border p-4 transition has-checked:border-primary has-checked:bg-primary/5">
                  <input
                    type="radio"
                    value="express"
                    className="mt-1"
                    {...register("shippingMethod")}
                  />

                  <Zap className="mt-0.5 h-5 w-5" />

                  <span className="flex flex-1 justify-between gap-4">
                    <span>
                      <span className="block font-semibold">
                        Express Delivery
                      </span>

                      <span className="mt-1 block text-sm text-muted-foreground">
                        Estimated delivery in 1–3 business
                        days.
                      </span>
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        EXPRESS_SHIPPING_COST,
                        "INR",
                      )}
                    </span>
                  </span>
                </label>
              </div>

              <FieldErrorMessage
                error={errors.shippingMethod}
              />
            </section>

            <section className="rounded-2xl border p-6">
              <label
                htmlFor="orderNotes"
                className="text-lg font-semibold"
              >
                Order Notes
              </label>

              <p className="mt-1 text-sm text-muted-foreground">
                Optional delivery or product instructions.
              </p>

              <textarea
                id="orderNotes"
                className={textareaClassName}
                {...register("orderNotes")}
              />

              <FieldErrorMessage
                error={errors.orderNotes}
              />
            </section>
          </div>

          <aside className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="text-2xl font-semibold">
              Order Summary
            </h2>

            <div className="mt-6 space-y-5">
              {cartProducts.map(
                ({
                  product,
                  quantity,
                }) => {
                  const primaryImage =
                    product.images[0];

                  return (
                    <div
                      key={product.id}
                      className="grid grid-cols-[72px_1fr] gap-4"
                    >
                      <div className="group overflow-hidden rounded-lg border bg-muted">
                        <ProductImage
                          src={primaryImage?.url}
                          alt={
                            primaryImage?.alt ??
                            product.name
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium">
                          {product.name}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Quantity: {quantity}
                        </p>

                        <p className="mt-2 text-sm font-semibold">
                          {formatCurrency(
                            product.price * quantity,
                            product.currency,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <div className="mt-6 space-y-4 border-t pt-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>

                <span>
                  {formatCurrency(subtotal, "INR")}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>

                <span>
                  {shippingCost === 0
                    ? "Free"
                    : formatCurrency(
                        shippingCost,
                        "INR",
                      )}
                </span>
              </div>

              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total</span>

                <span>
                  {formatCurrency(total, "INR")}
                </span>
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                {...register("acceptTerms")}
              />

              <span>
                I agree to the terms, privacy policy,
                and order conditions.
              </span>
            </label>

            <FieldErrorMessage
              error={errors.acceptTerms}
            />

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="mt-6 w-full"
            >
              <PackageCheck className="h-5 w-5" />

              {isSubmitting
                ? "Placing Order..."
                : `Place Order • ${formatCurrency(
                    total,
                    "INR",
                  )}`}
            </Button>

            <Link
              href="/cart"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                }),
                "mt-3 w-full",
              )}
            >
              Return to Cart
            </Link>
          </aside>
        </div>
      </form>
    </Container>
  );
}