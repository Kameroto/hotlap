"use client";

import {
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  LogIn,
  ShoppingBag,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  toast,
} from "sonner";

import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import ShippingMethodSelector from "@/components/checkout/ShippingMethodSelector";
import Container from "@/components/layout/Container";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  ApiClientError,
} from "@/lib/api/client";

import type {
  ServerCartItem,
} from "@/lib/api/types";

import {
  createOrder,
} from "@/lib/api/orders";

import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/lib/checkout-schema";

import {
  getShippingMethod,
  type ShippingMethodId,
} from "@/lib/shipping";

import {
  cn,
} from "@/lib/utils";

import {
  useAuthStore,
} from "@/store/auth-store";

import {
  useCartStore,
} from "@/store/cart-store";

import type {
  Product,
} from "@/types/product";

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

type CheckoutFormProps = {
  directCheckoutRequested?: boolean;
  directProduct?:
    | Product
    | null;
};

export default function CheckoutForm({
  directCheckoutRequested = false,
  directProduct = null,
}: CheckoutFormProps) {
  const router =
    useRouter();

  const user =
    useAuthStore(
      (state) =>
        state.user,
    );

  const authStatus =
    useAuthStore(
      (state) =>
        state.status,
    );

  const cart =
    useCartStore(
      (state) =>
        state.cart,
    );

  const cartHasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
    );

  const refreshCart =
    useCartStore(
      (state) =>
        state.refreshCart,
    );

  const [
    selectedShippingMethod,
    setSelectedShippingMethod,
  ] =
    useState<ShippingMethodId>(
      "standard",
    );

  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CheckoutFormValues>({
    resolver:
      zodResolver(
        checkoutSchema,
      ),

    defaultValues: {
      email:
        user?.email ?? "",

      phone:
        user?.phone ?? "",

      firstName:
        user?.firstName ?? "",

      lastName:
        user?.lastName ?? "",

      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",

      shippingMethod:
        "standard",

      orderNotes: "",

      acceptTerms:
        false,
    },
  });

  const directCheckoutIsValid =
    directCheckoutRequested &&
    directProduct !== null &&
    directProduct.isInStock;

  const directCheckoutItems:
    ServerCartItem[] =
    directCheckoutIsValid
      ? [
          {
            id: `direct-${directProduct.id}`,
            quantity: 1,
            lineTotal:
              directProduct.price,
            product:
              directProduct,
          },
        ]
      : [];

  if (
    authStatus === "loading" ||
    (!directCheckoutRequested &&
      !cartHasHydrated)
  ) {
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

  if (
    !user ||
    authStatus !==
      "authenticated"
  ) {
    return (
      <Container>
        <div className="mx-auto max-w-xl rounded-3xl border p-10 text-center">
          <LogIn className="mx-auto h-9 w-9 text-red-600" />

          <h1 className="mt-5 text-3xl font-bold">
            Sign in to checkout
          </h1>

          <p className="mt-3 text-muted-foreground">
            HotLap checkout requires
            an account so your order
            history and delivery
            details can be stored
            securely.
          </p>

          <Link
            href={
              directCheckoutIsValid
                ? `/login?next=${encodeURIComponent(`/checkout?buyNow=${directProduct.slug}`)}`
                : "/login?next=%2Fcheckout"
            }
            className={cn(
              buttonVariants({
                size: "lg",
              }),
              "mt-7",
            )}
          >
            Sign In
          </Link>
        </div>
      </Container>
    );
  }

  if (
    directCheckoutRequested &&
    !directCheckoutIsValid
  ) {
    return (
      <Container>
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-9 w-9 text-muted-foreground" />

          <h1 className="mt-5 text-3xl font-bold">
            Product unavailable
          </h1>

          <p className="mt-3 text-muted-foreground">
            This direct checkout link
            is invalid or the selected
            product is no longer
            available. Your cart has
            not been changed.
          </p>

          <Link
            href="/products"
            className={cn(
              buttonVariants({
                size: "lg",
              }),
              "mt-7",
            )}
          >
            Browse Products
          </Link>
        </div>
      </Container>
    );
  }

  if (
    !directCheckoutIsValid &&
    (!cart ||
      cart.items.length === 0)
  ) {
    return (
      <Container>
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed px-6 py-16 text-center">
          <ShoppingBag className="mx-auto h-9 w-9 text-muted-foreground" />

          <h1 className="mt-5 text-3xl font-bold">
            Your cart is empty
          </h1>

          <p className="mt-3 text-muted-foreground">
            Add products before
            starting checkout.
          </p>

          <Link
            href="/products"
            className={cn(
              buttonVariants({
                size: "lg",
              }),
              "mt-7",
            )}
          >
            Browse Products
          </Link>
        </div>
      </Container>
    );
  }

  const checkoutItems =
    directCheckoutIsValid
      ? directCheckoutItems
      : cart?.items ?? [];

  const checkoutSubtotal =
    directCheckoutIsValid
      ? directProduct.price
      : cart?.subtotal ?? 0;

  const checkoutDiscountAmount =
    directCheckoutIsValid
      ? 0
      : cart?.discountAmount ??
        0;

  const checkoutPromotionCode =
    directCheckoutIsValid
      ? null
      : cart?.coupon?.isValid
        ? cart.coupon.code
        : null;

  const checkoutTotalBeforeShipping =
    directCheckoutIsValid
      ? checkoutSubtotal
      : cart
          ?.totalBeforeShipping ??
        checkoutSubtotal;

  const shippingMethod =
    getShippingMethod(
      selectedShippingMethod,
      checkoutSubtotal,
    );

  const total =
    checkoutTotalBeforeShipping +
    shippingMethod.cost;

  async function submitCheckout(
    values: CheckoutFormValues,
  ): Promise<void> {
    try {
      const response =
        await createOrder({
          directPurchase:
            directCheckoutIsValid
              ? {
                  productId:
                    directProduct.id,
                  quantity: 1,
                }
              : undefined,

          deliveryAddress: {
            recipientName:
              `${values.firstName.trim()} ${values.lastName.trim()}`,

            phone:
              values.phone.trim(),

            addressLine1:
              values.addressLine1.trim(),

            addressLine2:
              values.addressLine2?.trim() ||
              null,

            city:
              values.city.trim(),

            state:
              values.state.trim(),

            postalCode:
              values.postalCode.trim(),

            country:
              "India",
          },

          shippingMethod:
            values.shippingMethod ===
            "express"
              ? "EXPRESS"
              : "STANDARD",

          paymentMethod:
            "CASH_ON_DELIVERY",

          notes:
            values.orderNotes?.trim() ||
            null,
        });

      if (
        !directCheckoutIsValid
      ) {
        await refreshCart();
      }

      toast.success(
        `Order ${response.order.orderNumber} placed successfully.`,
      );

      router.push(
        `/account/orders/${response.order.orderNumber}`,
      );
    } catch (error) {
      const message =
        error instanceof
        ApiClientError
          ? error.message
          : "Unable to place your order.";

      toast.error(
        message,
      );
    }
  }

  return (
    <Container>
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Secure Checkout
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight lg:text-5xl">
          Complete Your Order
        </h1>

        <p className="mt-4 max-w-2xl text-muted-foreground">
          Confirm your delivery
          information and shipping
          preference.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(
          submitCheckout,
        )}
        noValidate
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold">
                Contact Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-email"
                    className="text-sm font-medium"
                  >
                    Email address
                  </label>

                  <input
                    id="checkout-email"
                    type="email"
                    autoComplete="email"
                    className={
                      inputClassName
                    }
                    {...register(
                      "email",
                    )}
                  />

                  <FieldErrorMessage
                    error={
                      errors.email
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-first-name"
                    className="text-sm font-medium"
                  >
                    First name
                  </label>

                  <input
                    id="checkout-first-name"
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
                    htmlFor="checkout-last-name"
                    className="text-sm font-medium"
                  >
                    Last name
                  </label>

                  <input
                    id="checkout-last-name"
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
                    htmlFor="checkout-phone"
                    className="text-sm font-medium"
                  >
                    Mobile number
                  </label>

                  <input
                    id="checkout-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    className={
                      inputClassName
                    }
                    {...register(
                      "phone",
                    )}
                  />

                  <FieldErrorMessage
                    error={
                      errors.phone
                    }
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold">
                Delivery Address
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="checkout-address-1"
                    className="text-sm font-medium"
                  >
                    Address
                  </label>

                  <input
                    id="checkout-address-1"
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
                    htmlFor="checkout-address-2"
                    className="text-sm font-medium"
                  >
                    Apartment, building
                    or landmark
                  </label>

                  <input
                    id="checkout-address-2"
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
                    htmlFor="checkout-city"
                    className="text-sm font-medium"
                  >
                    City
                  </label>

                  <input
                    id="checkout-city"
                    autoComplete="address-level2"
                    className={
                      inputClassName
                    }
                    {...register(
                      "city",
                    )}
                  />

                  <FieldErrorMessage
                    error={
                      errors.city
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-state"
                    className="text-sm font-medium"
                  >
                    State / Union Territory
                  </label>

                  <select
                    id="checkout-state"
                    autoComplete="address-level1"
                    className={
                      inputClassName
                    }
                    {...register(
                      "state",
                    )}
                  >
                    <option value="">
                      Select state
                    </option>

                    {indianStates.map(
                      (state) => (
                        <option
                          key={
                            state
                          }
                          value={
                            state
                          }
                        >
                          {
                            state
                          }
                        </option>
                      ),
                    )}
                  </select>

                  <FieldErrorMessage
                    error={
                      errors.state
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-postal-code"
                    className="text-sm font-medium"
                  >
                    PIN code
                  </label>

                  <input
                    id="checkout-postal-code"
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
              subtotal={
                checkoutSubtotal
              }
              selectedMethod={
                selectedShippingMethod
              }
              onMethodChange={
                setSelectedShippingMethod
              }
              register={
                register
              }
              error={
                errors.shippingMethod
              }
            />

            <section className="rounded-2xl border p-6">
              <label
                htmlFor="checkout-notes"
                className="text-xl font-semibold"
              >
                Order Notes
              </label>

              <p className="mt-1 text-sm text-muted-foreground">
                Optional delivery or
                product instructions.
              </p>

              <textarea
                id="checkout-notes"
                className={
                  textareaClassName
                }
                {...register(
                  "orderNotes",
                )}
              />

              <FieldErrorMessage
                error={
                  errors.orderNotes
                }
              />
            </section>
          </div>

          <CheckoutOrderSummary
            items={
              checkoutItems
            }
            subtotal={
              checkoutSubtotal
            }
            discountAmount={
              checkoutDiscountAmount
            }
            promotionCode={
              checkoutPromotionCode
            }
            shippingCost={
              shippingMethod.cost
            }
            total={
              total
            }
            register={
              register
            }
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
