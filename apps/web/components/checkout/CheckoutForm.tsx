"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  AlertTriangle,
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  useForm,
  useWatch,
  type FieldError,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  toast,
} from "sonner";

import CheckoutAddressSelector from "@/components/checkout/CheckoutAddressSelector";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import ShippingMethodSelector from "@/components/checkout/ShippingMethodSelector";
import Container from "@/components/layout/Container";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  ApiClientError,
  getAccountAddresses,
} from "@/lib/api/client";

import type {
  Address,
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
  "mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

const textareaClassName =
  "mt-2 min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

type CheckoutFormProps = {
  directCheckoutRequested?: boolean;
  directProduct?: Product | null;
};

type AddressLoadStatus =
  | "idle"
  | "loading"
  | "loaded"
  | "error";

type SubmissionFeedback = {
  type: "error" | "success";
  message: string;
} | null;

export default function CheckoutForm({
  directCheckoutRequested = false,
  directProduct = null,
}: CheckoutFormProps) {
  const router = useRouter();

  const user = useAuthStore(
    (state) => state.user,
  );

  const authStatus = useAuthStore(
    (state) => state.status,
  );

  const cart = useCartStore(
    (state) => state.cart,
  );

  const cartLoadStatus =
    useCartStore(
      (state) =>
        state.loadStatus,
    );

  const cartLoadError =
    useCartStore(
      (state) =>
        state.loadError,
    );

  const cartIsLoading =
    useCartStore(
      (state) =>
        state.isLoading,
    );

  const cartIsReconciling =
    useCartStore(
      (state) =>
        state.isReconciling,
    );

  const cartItemMutationIsPending =
    useCartStore(
      (state) =>
        state.pendingProductIds.length >
        0,
    );

  const refreshCart =
    useCartStore(
      (state) =>
        state.refreshCart,
    );

  const [
    selectedShippingMethod,
    setSelectedShippingMethod,
  ] = useState<ShippingMethodId>(
    "standard",
  );

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [
    addressLoadStatus,
    setAddressLoadStatus,
  ] = useState<AddressLoadStatus>(
    "loading",
  );

  const [
    addressLoadError,
    setAddressLoadError,
  ] = useState<string | null>(
    null,
  );

  const [
    addressRequestVersion,
    setAddressRequestVersion,
  ] = useState(0);

  const [
    submissionFeedback,
    setSubmissionFeedback,
  ] = useState<SubmissionFeedback>(
    null,
  );

  const [
    submissionIsPending,
    setSubmissionIsPending,
  ] = useState(false);

  const submissionIsInFlight =
    useRef(false);

  const submissionFeedbackReference =
    useRef<HTMLDivElement>(null);

  const addressSelectionWasTouched =
    useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getFieldState,

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
      addressMode: "manual",
      addressId: null,
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
      confirmOrderDetails: false,
    },
  });

  const addressMode = useWatch({
    control,
    name: "addressMode",
  });

  const selectedAddressId =
    useWatch({
      control,
      name: "addressId",
    });

  useEffect(() => {
    if (!user) {
      return;
    }

    setValue("email", user.email);

    if (
      !getFieldState(
        "firstName",
      ).isDirty
    ) {
      setValue(
        "firstName",
        user.firstName,
      );
    }

    if (
      !getFieldState(
        "lastName",
      ).isDirty
    ) {
      setValue(
        "lastName",
        user.lastName,
      );
    }

    if (
      user.phone &&
      !getFieldState(
        "phone",
      ).isDirty
    ) {
      setValue(
        "phone",
        user.phone,
      );
    }
  }, [
    getFieldState,
    setValue,
    user,
  ]);

  useEffect(() => {
    if (
      authStatus !==
      "authenticated"
    ) {
      return;
    }

    let requestIsActive = true;

    void getAccountAddresses()
      .then((response) => {
        if (!requestIsActive) {
          return;
        }

        setAddresses(
          response.addresses,
        );
        setAddressLoadStatus(
          "loaded",
        );

        if (
          addressSelectionWasTouched.current
        ) {
          return;
        }

        const preferredAddress =
          response.addresses.find(
            (address) =>
              address.isDefault,
          ) ?? response.addresses[0];

        if (preferredAddress) {
          setValue(
            "addressMode",
            "saved",
          );
          setValue(
            "addressId",
            preferredAddress.id,
          );
          return;
        }

        setValue(
          "addressMode",
          "manual",
        );
        setValue(
          "addressId",
          null,
        );
      })
      .catch((error: unknown) => {
        if (!requestIsActive) {
          return;
        }

        setAddresses([]);
        setAddressLoadStatus(
          "error",
        );
        setAddressLoadError(
          getErrorMessage(
            error,
            "Unable to load your saved addresses.",
          ),
        );

        if (
          !addressSelectionWasTouched.current
        ) {
          setValue(
            "addressMode",
            "manual",
          );
          setValue(
            "addressId",
            null,
          );

          addressSelectionWasTouched.current =
            true;
        }
      });

    return () => {
      requestIsActive = false;
    };
  }, [
    addressRequestVersion,
    authStatus,
    setValue,
  ]);

  const directCheckoutIsValid =
    directCheckoutRequested &&
    directProduct !== null &&
    directProduct.isInStock;

  if (
    directCheckoutRequested &&
    !directCheckoutIsValid
  ) {
    return (
      <CheckoutStateShell
        icon={
          <ShoppingBag className="size-6" />
        }
        title="Product unavailable"
        description="This direct checkout link is invalid or the selected product is no longer available. Your cart has not been changed."
      >
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
          <ArrowRight className="size-4" />
        </Link>
      </CheckoutStateShell>
    );
  }

  if (
    authStatus === "idle" ||
    authStatus === "loading"
  ) {
    return <CheckoutLoadingState />;
  }

  if (
    !user ||
    authStatus !== "authenticated"
  ) {
    const loginDestination =
      directCheckoutIsValid
        ? `/login?next=${encodeURIComponent(
            `/checkout?buyNow=${directProduct.slug}`,
          )}`
        : "/login?next=%2Fcheckout";

    return (
      <CheckoutStateShell
        icon={
          <LogIn className="size-6" />
        }
        title="Sign in to checkout"
        description="HotLap checkout requires an account so your order and delivery information remain connected to you."
      >
        <Link
          href={loginDestination}
          className={cn(
            buttonVariants({
              size: "lg",
            }),
            "mt-7",
          )}
        >
          Sign In
          <ArrowRight className="size-4" />
        </Link>
      </CheckoutStateShell>
    );
  }

  const normalCartIsLoading =
    !directCheckoutIsValid &&
    (
      cartLoadStatus === "idle" ||
      cartLoadStatus === "loading" ||
      cartIsLoading ||
      cartIsReconciling
    );

  if (normalCartIsLoading) {
    return <CheckoutLoadingState />;
  }

  if (
    !directCheckoutIsValid &&
    cartLoadStatus === "error"
  ) {
    return (
      <CheckoutStateShell
        icon={
          <AlertTriangle className="size-6" />
        }
        title="Your cart needs to be refreshed"
        description={`${cartLoadError ?? "Unable to confirm your current cart."} Your last confirmed cart has not been discarded.`}
      >
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            disabled={cartIsLoading}
            onClick={() => {
              void refreshCart().catch(
                (error: unknown) => {
                  toast.error(
                    getErrorMessage(
                      error,
                      "Unable to refresh your cart.",
                    ),
                  );
                },
              );
            }}
          >
            {cartIsLoading ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Retry
          </Button>
          <Link
            href="/cart"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
              }),
              "border-white/12",
            )}
          >
            Return to Cart
          </Link>
        </div>
      </CheckoutStateShell>
    );
  }

  if (
    !directCheckoutIsValid &&
    (!cart || cart.items.length === 0)
  ) {
    return (
      <CheckoutStateShell
        icon={
          <ShoppingBag className="size-6" />
        }
        title="Your cart is empty"
        description="Add products to your cart before starting normal checkout."
      >
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
          <ArrowRight className="size-4" />
        </Link>
      </CheckoutStateShell>
    );
  }

  if (
    !directCheckoutIsValid &&
    cart?.coupon?.isValid ===
      false
  ) {
    return (
      <CheckoutStateShell
        icon={
          <AlertTriangle className="size-6" />
        }
        title="Your coupon needs attention"
        description={`${cart.coupon.message} Remove or resolve the coupon in your cart before checkout. The coupon has not been removed automatically.`}
      >
        <Link
          href="/cart"
          className={cn(
            buttonVariants({
              size: "lg",
            }),
            "mt-7",
          )}
        >
          Return to Cart
          <ArrowRight className="size-4" />
        </Link>
      </CheckoutStateShell>
    );
  }

  const invalidCartItems =
    directCheckoutIsValid
      ? []
      : cart?.items.filter(
          itemHasCheckoutConflict,
        ) ?? [];

  if (invalidCartItems.length > 0) {
    return (
      <CheckoutStateShell
        icon={
          <AlertTriangle className="size-6" />
        }
        title="Your cart needs attention"
        description={`${invalidCartItems.length} ${invalidCartItems.length === 1 ? "item has" : "items have"} an availability conflict. Resolve the cart before checkout; quantities have not been changed automatically.`}
      >
        <Link
          href="/cart"
          className={cn(
            buttonVariants({
              size: "lg",
            }),
            "mt-7",
          )}
        >
          Return to Cart
          <ArrowRight className="size-4" />
        </Link>
      </CheckoutStateShell>
    );
  }

  const directCheckoutItems:
    ServerCartItem[] =
    directCheckoutIsValid
      ? [
          {
            id: `direct-${directProduct.id}`,
            quantity: 1,
            lineTotal:
              directProduct.price,
            isPurchasable: true,
            product: directProduct,
          },
        ]
      : [];

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
      : cart?.discountAmount ?? 0;

  const checkoutPromotionCode =
    directCheckoutIsValid
      ? null
      : cart?.coupon?.isValid
        ? cart.coupon.code
        : null;

  const checkoutTotalBeforeShipping =
    directCheckoutIsValid
      ? checkoutSubtotal
      : cart?.totalBeforeShipping ??
        checkoutSubtotal;

  const shippingMethod =
    getShippingMethod(
      selectedShippingMethod,
      checkoutSubtotal,
    );

  const total =
    checkoutTotalBeforeShipping +
    shippingMethod.cost;

  const checkoutInitializationIsPending =
    addressLoadStatus === "idle" ||
    addressLoadStatus === "loading" ||
    cartItemMutationIsPending;

  const checkoutSubmissionIsPending =
    isSubmitting ||
    submissionIsPending;

  async function submitCheckout(
    values: CheckoutFormValues,
  ): Promise<void> {
    if (
      submissionIsInFlight.current
    ) {
      return;
    }

    submissionIsInFlight.current =
      true;
    setSubmissionIsPending(true);
    setSubmissionFeedback(null);

    try {
      const usesSavedAddress =
        values.addressMode ===
          "saved" &&
        values.addressId !== null;

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

          addressId: usesSavedAddress
            ? values.addressId
            : null,

          deliveryAddress:
            usesSavedAddress
              ? undefined
              : {
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
                  country: "India",
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

      const successMessage =
        `Order ${response.order.orderNumber} placed successfully.`;

      setSubmissionFeedback({
        type: "success",
        message: successMessage,
      });
      toast.success(successMessage);

      if (!directCheckoutIsValid) {
        void refreshCart().catch(
          (error: unknown) => {
            console.error(
              "Post-order cart refresh failed:",
              error,
            );
          },
        );
      }

      let confirmationMarker:
        | string
        | null = null;

      try {
        confirmationMarker =
          window.crypto.randomUUID();

        window.sessionStorage.setItem(
          "hotlap-order-confirmation",
          confirmationMarker,
        );
      } catch {
        confirmationMarker = null;
      }

      const orderDestination =
        `/account/orders/${response.order.orderNumber}`;

      router.push(
        confirmationMarker
          ? `${orderDestination}?placed=${encodeURIComponent(
              confirmationMarker,
            )}`
          : orderDestination,
      );
    } catch (error) {
      submissionIsInFlight.current =
        false;
      setSubmissionIsPending(false);

      const message = getErrorMessage(
        error,
        "Unable to place your order.",
      );

      setSubmissionFeedback({
        type: "error",
        message,
      });
      toast.error(message);

      requestAnimationFrame(() => {
        submissionFeedbackReference.current?.focus();
      });

      if (
        error instanceof
          ApiClientError &&
        error.code ===
          "ADDRESS_NOT_FOUND"
      ) {
        addressSelectionWasTouched.current =
          true;
        setValue(
          "addressMode",
          "manual",
        );
        setValue(
          "addressId",
          null,
        );
        setAddressLoadStatus(
          "loading",
        );
        setAddressLoadError(null);
        setAddressRequestVersion(
          (version) =>
            version + 1,
        );
      }

      if (
        !directCheckoutIsValid &&
        error instanceof
          ApiClientError &&
        [
          "INSUFFICIENT_STOCK",
          "PRODUCT_UNAVAILABLE",
          "CART_COUPON_INVALID",
          "EMPTY_CART",
        ].includes(error.code)
      ) {
        void refreshCart().catch(
          () => undefined,
        );
      }
    }
  }

  return (
    <Container>
      <div className="relative">
        <div className="mb-10">
          <p className="hotlap-kicker">
            Secure Checkout
          </p>
          <h1 className="hotlap-heading mt-4 text-4xl text-foreground sm:text-5xl">
            Complete Your Order.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Confirm your account, delivery, shipping, and order information before placing the order.
          </p>
        </div>

        {submissionFeedback && (
          <div
            ref={
              submissionFeedbackReference
            }
            tabIndex={-1}
            role={
              submissionFeedback.type ===
              "error"
                ? "alert"
                : "status"
            }
            className={cn(
              "mb-6 flex gap-3 rounded-2xl border p-4 text-sm leading-6",
              submissionFeedback.type ===
                "error"
                ? "border-destructive/30 bg-destructive/[0.07] text-foreground"
                : "border-emerald-400/25 bg-emerald-400/[0.06] text-foreground",
            )}
          >
            {submissionFeedback.type ===
            "error" ? (
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            ) : (
              <LockKeyhole className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            )}
            <p>{submissionFeedback.message}</p>
          </div>
        )}

        <form
          onSubmit={(event) => {
            if (
              submissionIsInFlight.current
            ) {
              event.preventDefault();
              return;
            }

            void handleSubmit(
              submitCheckout,
            )(event);
          }}
          noValidate
          aria-busy={
            checkoutSubmissionIsPending
          }
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
            <div className="space-y-6">
              <section className="rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.2)] sm:p-6">
                <p className="hotlap-kicker">
                  Account
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                  Contact Information
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Order updates use the email associated with your authenticated HotLap account.
                </p>

                <div className="mt-6">
                  <label
                    htmlFor="checkout-email"
                    className="text-sm font-semibold text-foreground"
                  >
                    Account email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    readOnly
                    aria-readonly="true"
                    aria-describedby="checkout-email-description"
                    autoComplete="email"
                    className={cn(
                      inputClassName,
                      "cursor-default opacity-80",
                    )}
                    {...register("email")}
                  />
                  <p
                    id="checkout-email-description"
                    className="mt-2 text-xs leading-5 text-muted-foreground"
                  >
                    Checkout uses this authenticated account email for the order.
                  </p>
                </div>
              </section>

              <CheckoutAddressSelector
                addresses={addresses}
                selectedAddressId={
                  selectedAddressId
                }
                manualAddressIsSelected={
                  addressMode ===
                  "manual"
                }
                isLoading={
                  addressLoadStatus ===
                  "loading"
                }
                error={addressLoadError}
                selectionError={
                  errors.addressId
                    ?.message
                }
                onSelectAddress={(addressId) => {
                  addressSelectionWasTouched.current =
                    true;
                  setValue(
                    "addressMode",
                    "saved",
                    {
                      shouldValidate: true,
                    },
                  );
                  setValue(
                    "addressId",
                    addressId,
                    {
                      shouldValidate: true,
                    },
                  );
                }}
                onSelectManualAddress={() => {
                  addressSelectionWasTouched.current =
                    true;
                  setValue(
                    "addressMode",
                    "manual",
                    {
                      shouldValidate: true,
                    },
                  );
                  setValue(
                    "addressId",
                    null,
                    {
                      shouldValidate: true,
                    },
                  );
                }}
                onRetry={() => {
                  setAddressLoadStatus(
                    "loading",
                  );
                  setAddressLoadError(
                    null,
                  );
                  setAddressRequestVersion(
                    (version) =>
                      version + 1,
                  );
                }}
              />

              {addressMode === "manual" &&
                addressLoadStatus !==
                  "loading" && (
                  <ManualAddressFields
                    register={register}
                    errors={errors}
                  />
                )}

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
                register={register}
                error={
                  errors.shippingMethod
                }
              />

              <section className="rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.2)] sm:p-6">
                <label
                  htmlFor="checkout-notes"
                  className="text-xl font-bold tracking-tight text-foreground"
                >
                  Order Notes
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    Optional
                  </span>
                </label>
                <p
                  id="checkout-notes-description"
                  className="mt-2 text-sm leading-6 text-muted-foreground"
                >
                  Add relevant instructions for this order without including sensitive information.
                </p>
                <textarea
                  id="checkout-notes"
                  aria-invalid={
                    Boolean(
                      errors.orderNotes,
                    )
                  }
                  aria-describedby={
                    errors.orderNotes
                      ? "checkout-notes-description checkout-notes-error"
                      : "checkout-notes-description"
                  }
                  className={
                    textareaClassName
                  }
                  {...register(
                    "orderNotes",
                  )}
                />
                <FieldErrorMessage
                  id="checkout-notes-error"
                  error={
                    errors.orderNotes
                  }
                />
              </section>
            </div>

            <CheckoutOrderSummary
              items={checkoutItems}
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
              total={total}
              register={register}
              confirmationError={
                errors.confirmOrderDetails
              }
              isSubmitting={
                checkoutSubmissionIsPending
              }
              isDisabled={
                checkoutInitializationIsPending
              }
            />
          </div>
        </form>
      </div>
    </Container>
  );
}

function ManualAddressFields({
  register,
  errors,
}: {
  register:
    UseFormRegister<CheckoutFormValues>;
  errors: FieldErrors<CheckoutFormValues>;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.2)] sm:p-6">
      <p className="hotlap-kicker">
        New Address
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        Enter Delivery Details
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Required fields are marked with an asterisk. This address is used for this order only.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <CheckoutField
          id="checkout-first-name"
          label="First name"
          required
          error={errors.firstName}
        >
          <input
            id="checkout-first-name"
            required
            autoComplete="given-name"
            aria-invalid={
              Boolean(errors.firstName)
            }
            aria-describedby={
              errors.firstName
                ? "checkout-first-name-error"
                : undefined
            }
            className={inputClassName}
            {...register("firstName")}
          />
        </CheckoutField>

        <CheckoutField
          id="checkout-last-name"
          label="Last name"
          required
          error={errors.lastName}
        >
          <input
            id="checkout-last-name"
            required
            autoComplete="family-name"
            aria-invalid={
              Boolean(errors.lastName)
            }
            aria-describedby={
              errors.lastName
                ? "checkout-last-name-error"
                : undefined
            }
            className={inputClassName}
            {...register("lastName")}
          />
        </CheckoutField>

        <div className="sm:col-span-2">
          <CheckoutField
            id="checkout-phone"
            label="Mobile number"
            required
            error={errors.phone}
          >
            <input
              id="checkout-phone"
              type="tel"
              required
              inputMode="numeric"
              autoComplete="tel"
              aria-invalid={
                Boolean(errors.phone)
              }
              aria-describedby={
                errors.phone
                  ? "checkout-phone-error"
                  : undefined
              }
              className={inputClassName}
              {...register("phone")}
            />
          </CheckoutField>
        </div>

        <div className="sm:col-span-2">
          <CheckoutField
            id="checkout-address-1"
            label="Street address"
            required
            error={
              errors.addressLine1
            }
          >
            <input
              id="checkout-address-1"
              required
              autoComplete="address-line1"
              aria-invalid={
                Boolean(
                  errors.addressLine1,
                )
              }
              aria-describedby={
                errors.addressLine1
                  ? "checkout-address-1-error"
                  : undefined
              }
              className={inputClassName}
              {...register(
                "addressLine1",
              )}
            />
          </CheckoutField>
        </div>

        <div className="sm:col-span-2">
          <CheckoutField
            id="checkout-address-2"
            label="Apartment, building or landmark"
            error={
              errors.addressLine2
            }
          >
            <input
              id="checkout-address-2"
              autoComplete="address-line2"
              aria-invalid={
                Boolean(
                  errors.addressLine2,
                )
              }
              aria-describedby={
                errors.addressLine2
                  ? "checkout-address-2-error"
                  : undefined
              }
              className={inputClassName}
              {...register(
                "addressLine2",
              )}
            />
          </CheckoutField>
        </div>

        <CheckoutField
          id="checkout-city"
          label="City"
          required
          error={errors.city}
        >
          <input
            id="checkout-city"
            required
            autoComplete="address-level2"
            aria-invalid={
              Boolean(errors.city)
            }
            aria-describedby={
              errors.city
                ? "checkout-city-error"
                : undefined
            }
            className={inputClassName}
            {...register("city")}
          />
        </CheckoutField>

        <CheckoutField
          id="checkout-state"
          label="State / Union Territory"
          required
          error={errors.state}
        >
          <select
            id="checkout-state"
            required
            autoComplete="address-level1"
            aria-invalid={
              Boolean(errors.state)
            }
            aria-describedby={
              errors.state
                ? "checkout-state-error"
                : undefined
            }
            className={inputClassName}
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
        </CheckoutField>

        <CheckoutField
          id="checkout-postal-code"
          label="PIN code"
          required
          error={errors.postalCode}
        >
          <input
            id="checkout-postal-code"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            aria-invalid={
              Boolean(
                errors.postalCode,
              )
            }
            aria-describedby={
              errors.postalCode
                ? "checkout-postal-code-error"
                : undefined
            }
            className={inputClassName}
            {...register(
              "postalCode",
            )}
          />
        </CheckoutField>
      </div>
    </section>
  );
}

function CheckoutField({
  id,
  label,
  required = false,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-foreground"
      >
        {label}
        {required && (
          <span
            aria-hidden="true"
            className="ml-1 text-primary"
          >
            *
          </span>
        )}
      </label>
      {children}
      <FieldErrorMessage
        id={`${id}-error`}
        error={error}
      />
    </div>
  );
}

function FieldErrorMessage({
  id,
  error,
}: {
  id: string;
  error?: FieldError;
}) {
  if (!error?.message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 text-sm text-destructive"
    >
      {error.message}
    </p>
  );
}

function CheckoutLoadingState() {
  return (
    <Container>
      <div
        role="status"
        className="animate-pulse motion-reduce:animate-none"
      >
        <div className="h-4 w-32 rounded bg-primary/15" />
        <div className="mt-5 h-12 max-w-md rounded bg-white/8" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <div className="h-56 rounded-2xl border border-white/10 bg-[#101316]" />
            <div className="h-72 rounded-2xl border border-white/10 bg-[#101316]" />
          </div>
          <div className="h-[32rem] rounded-2xl border border-white/10 bg-[#101316]" />
        </div>
        <span className="sr-only">
          Loading checkout
        </span>
      </div>
    </Container>
  );
}

function CheckoutStateShell({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Container>
      <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#101316] px-6 py-14 text-center shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:px-10 sm:py-16">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary">
          {icon}
        </div>
        <h1 className="hotlap-heading mt-6 text-3xl text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
        {children}
      </div>
    </Container>
  );
}

function itemHasCheckoutConflict(
  item: ServerCartItem,
): boolean {
  return (
    !item.isPurchasable ||
    item.product.stockQuantity <=
      0 ||
    item.quantity >
      item.product.stockQuantity
  );
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof
    ApiClientError
    ? error.message
    : fallbackMessage;
}
