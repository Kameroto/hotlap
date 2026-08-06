"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

import {
  useForm,
  useWatch,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import ShippingMethodSelector from "@/components/checkout/ShippingMethodSelector";

import Container from "@/components/layout/Container";

import {
  buttonVariants,
} from "@/components/ui/button";

import { products } from "@/data/products";

import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/checkout-schema";

import {
  validatePromotion,
} from "@/lib/promotions";

import {
  getShippingMethod,
  type ShippingMethodId,
} from "@/lib/shipping";

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

const inputClassName =
  "mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const textareaClassName =
  "mt-2 min-h-28 w-full resize-y rounded-lg border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

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

export default function CheckoutForm() {
  const [
    completedOrderNumber,
    setCompletedOrderNumber,
  ] = useState<string | null>(null);

  const items = useCartStore(
    (state) => state.items,
  );

  const appliedPromotionCode =
    useCartStore(
      (state) =>
        state.appliedPromotionCode,
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
    resolver: zodResolver(
      checkoutSchema,
    ),

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

  const selectedShippingMethod =
    useWatch({
      control,
      name: "shippingMethod",
    });

  const cartProducts =
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
    });

  const subtotal =
    cartProducts.reduce(
      (total, cartProduct) =>
        total +
        cartProduct.product.price *
          cartProduct.quantity,
      0,
    );

  const promotionResult =
    appliedPromotionCode
      ? validatePromotion(
          appliedPromotionCode,
          subtotal,
        )
      : null;

  const discountAmount =
    promotionResult?.isValid
      ? promotionResult.discountAmount
      : 0;

  const subtotalAfterDiscount =
    Math.max(
      subtotal - discountAmount,
      0,
    );

  const shippingMethod =
    getShippingMethod(
      (
        selectedShippingMethod ??
        "standard"
      ) as ShippingMethodId,
      subtotal,
    );

  const shippingCost =
    shippingMethod.cost;

  const total =
    subtotalAfterDiscount +
    shippingCost;

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

    console.info(
      "Temporary checkout order",
      {
        orderNumber,
        customer: values,
        cartProducts,
        appliedPromotionCode:
          promotionResult?.isValid
            ? appliedPromotionCode
            : null,
        subtotal,
        discountAmount,
        shippingMethod,
        total,
      },
    );

    clearCart();

    setCompletedOrderNumber(
      orderNumber,
    );
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
            Your temporary HotLap order
            number is:
          </p>

          <p className="mt-2 text-xl font-bold">
            {completedOrderNumber}
          </p>

          <p className="mx-auto mt-5 max-w-lg text-muted-foreground">
            The backend will later store this
            order and send confirmation details.
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
            Add products before continuing
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
        onSubmit={handleSubmit(
          submitCheckout,
        )}
        noValidate
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold">
                Contact Information
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                We’ll use these details for
                order updates.
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
                    className={
                      inputClassName
                    }
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
                    className={
                      inputClassName
                    }
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
                    className={
                      inputClassName
                    }
                    {...register(
                      "firstName",
                    )}
                  />

                  <FieldErrorMessage
                    error={
                      errors.firstName
                    }
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
                    className={
                      inputClassName
                    }
                    {...register(
                      "lastName",
                    )}
                  />

                  <FieldErrorMessage
                    error={
                      errors.lastName
                    }
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
                    className={
                      inputClassName
                    }
                    {...register(
                      "addressLine1",
                    )}
                  />

                  <FieldErrorMessage
                    error={
                      errors.addressLine1
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressLine2"
                    className="text-sm font-medium"
                  >
                    Apartment, building,
                    landmark
                    <span className="ml-1 text-muted-foreground">
                      (optional)
                    </span>
                  </label>

                  <input
                    id="addressLine2"
                    autoComplete="address-line2"
                    className={
                      inputClassName
                    }
                    {...register(
                      "addressLine2",
                    )}
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
                    className={
                      inputClassName
                    }
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
                    className={
                      inputClassName
                    }
                    {...register("state")}
                  >
                    <option value="">
                      Select state
                    </option>

                    {indianStates.map(
                      (state) => (
                        <option
                          key={state}
                          value={state}
                        >
                          {state}
                        </option>
                      ),
                    )}
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
                    className={
                      inputClassName
                    }
                    {...register(
                      "postalCode",
                    )}
                  />

                  <FieldErrorMessage
                    error={
                      errors.postalCode
                    }
                  />
                </div>
              </div>
            </section>

            <ShippingMethodSelector
              subtotal={subtotal}
              register={register}
              error={
                errors.shippingMethod
              }
            />

            <section className="rounded-2xl border p-6">
              <label
                htmlFor="orderNotes"
                className="text-lg font-semibold"
              >
                Order Notes
              </label>

              <p className="mt-1 text-sm text-muted-foreground">
                Optional delivery or product
                instructions.
              </p>

              <textarea
                id="orderNotes"
                className={
                  textareaClassName
                }
                {...register("orderNotes")}
              />

              <FieldErrorMessage
                error={
                  errors.orderNotes
                }
              />
            </section>
          </div>

          <CheckoutOrderSummary
            cartProducts={cartProducts}
            subtotal={subtotal}
            discountAmount={
              discountAmount
            }
            appliedPromotionCode={
              promotionResult?.isValid
                ? appliedPromotionCode
                : null
            }
            shippingCost={shippingCost}
            total={total}
            register={register}
            acceptTermsError={
              errors.acceptTerms
            }
            isSubmitting={
              isSubmitting
            }
          />
        </div>
      </form>
    </Container>
  );
}