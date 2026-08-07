"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Home,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useForm,
  type FieldError,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import {
  ApiClientError,
  createAccountAddress,
  deleteAccountAddress,
  getAccountAddresses,
  setAccountDefaultAddress,
  updateAccountAddress,
} from "@/lib/api/client";

import type {
  Address,
  AddressRequest,
} from "@/lib/api/types";

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

const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .min(
      1,
      "Enter an address label.",
    )
    .max(50),

  recipientName: z
    .string()
    .trim()
    .min(
      2,
      "Enter the recipient name.",
    ),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number.",
    ),

  addressLine1: z
    .string()
    .trim()
    .min(
      5,
      "Enter a complete address.",
    ),

  addressLine2: z
    .string()
    .trim(),

  city: z
    .string()
    .trim()
    .min(
      2,
      "Enter the city.",
    ),

  state: z
    .string()
    .trim()
    .min(
      2,
      "Select the state.",
    ),

  postalCode: z
    .string()
    .trim()
    .regex(
      /^[1-9]\d{5}$/,
      "Enter a valid 6-digit PIN code.",
    ),

  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<
  typeof addressSchema
>;

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

const emptyFormValues: AddressFormValues = {
  label: "Home",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

function toAddressRequest(
  values: AddressFormValues,
): AddressRequest {
  return {
    label: values.label,

    recipientName:
      values.recipientName,

    phone: values.phone,

    addressLine1:
      values.addressLine1,

    addressLine2:
      values.addressLine2 || null,

    city: values.city,

    state: values.state,

    postalCode:
      values.postalCode,

    country: "India",

    isDefault:
      values.isDefault,
  };
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  return error instanceof ApiClientError
    ? error.message
    : fallbackMessage;
}

export default function AddressBook() {
  const [
    addresses,
    setAddresses,
  ] = useState<Address[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    formIsOpen,
    setFormIsOpen,
  ] = useState(false);

  const [
    editingAddressId,
    setEditingAddressId,
  ] = useState<string | null>(
    null,
  );

  const [
    deletingAddressId,
    setDeletingAddressId,
  ] = useState<string | null>(
    null,
  );

  const [
    settingDefaultAddressId,
    setSettingDefaultAddressId,
  ] = useState<string | null>(
    null,
  );

  const {
    register,
    reset,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(
      addressSchema,
    ),

    defaultValues:
      emptyFormValues,
  });

  useEffect(() => {
    let requestIsActive = true;

    void getAccountAddresses()
      .then((response) => {
        if (!requestIsActive) {
          return;
        }

        setAddresses(
          response.addresses,
        );
      })
      .catch((error: unknown) => {
        if (!requestIsActive) {
          return;
        }

        toast.error(
          getErrorMessage(
            error,
            "Unable to load your addresses.",
          ),
        );
      })
      .finally(() => {
        if (!requestIsActive) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      requestIsActive = false;
    };
  }, []);

  async function refreshAddresses(): Promise<void> {
    const response =
      await getAccountAddresses();

    setAddresses(
      response.addresses,
    );
  }

  function openNewAddressForm() {
    setEditingAddressId(null);

    reset({
      ...emptyFormValues,

      isDefault:
        addresses.length === 0,
    });

    setFormIsOpen(true);
  }

  function openEditAddressForm(
    address: Address,
  ) {
    setEditingAddressId(
      address.id,
    );

    reset({
      label:
        address.label ??
        "Address",

      recipientName:
        address.recipientName,

      phone:
        address.phone,

      addressLine1:
        address.addressLine1,

      addressLine2:
        address.addressLine2 ??
        "",

      city:
        address.city,

      state:
        address.state,

      postalCode:
        address.postalCode,

      isDefault:
        address.isDefault,
    });

    setFormIsOpen(true);
  }

  function closeAddressForm() {
    setFormIsOpen(false);
    setEditingAddressId(null);

    reset(
      emptyFormValues,
    );
  }

  async function saveAddress(
    values: AddressFormValues,
  ): Promise<void> {
    try {
      const request =
        toAddressRequest(values);

      if (editingAddressId) {
        await updateAccountAddress(
          editingAddressId,
          request,
        );

        toast.success(
          "The address has been updated.",
        );
      } else {
        await createAccountAddress(
          request,
        );

        toast.success(
          "The address has been added.",
        );
      }

      closeAddressForm();

      await refreshAddresses();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to save the address.",
        ),
      );
    }
  }

  async function makeDefaultAddress(
    addressId: string,
  ): Promise<void> {
    setSettingDefaultAddressId(
      addressId,
    );

    try {
      await setAccountDefaultAddress(
        addressId,
      );

      await refreshAddresses();

      toast.success(
        "Your default delivery address has been updated.",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to update the default address.",
        ),
      );
    } finally {
      setSettingDefaultAddressId(
        null,
      );
    }
  }

  async function removeAddress(
    addressId: string,
  ): Promise<void> {
    const confirmed =
      window.confirm(
        "Delete this delivery address?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingAddressId(
      addressId,
    );

    try {
      await deleteAccountAddress(
        addressId,
      );

      await refreshAddresses();

      toast.success(
        "The address has been deleted.",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to delete the address.",
        ),
      );
    } finally {
      setDeletingAddressId(
        null,
      );
    }
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={
            openNewAddressForm
          }
        >
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {formIsOpen && (
        <form
          onSubmit={handleSubmit(
            saveAddress,
          )}
          noValidate
          className="mt-6 rounded-2xl border bg-card p-6"
        >
          <div className="flex items-start justify-between gap-5">
            <div>
              <h2 className="text-xl font-semibold">
                {editingAddressId
                  ? "Edit Address"
                  : "Add Address"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter an Indian delivery address.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close address form"
              onClick={
                closeAddressForm
              }
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="address-label"
                className="text-sm font-medium"
              >
                Label
              </label>

              <input
                id="address-label"
                placeholder="Home or Office"
                className={
                  inputClassName
                }
                {...register("label")}
              />

              <FieldErrorMessage
                error={errors.label}
              />
            </div>

            <div>
              <label
                htmlFor="address-recipient"
                className="text-sm font-medium"
              >
                Recipient name
              </label>

              <input
                id="address-recipient"
                autoComplete="name"
                className={
                  inputClassName
                }
                {...register(
                  "recipientName",
                )}
              />

              <FieldErrorMessage
                error={
                  errors.recipientName
                }
              />
            </div>

            <div>
              <label
                htmlFor="address-phone"
                className="text-sm font-medium"
              >
                Mobile number
              </label>

              <input
                id="address-phone"
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

            <div>
              <label
                htmlFor="address-postal-code"
                className="text-sm font-medium"
              >
                PIN code
              </label>

              <input
                id="address-postal-code"
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

            <div className="sm:col-span-2">
              <label
                htmlFor="address-line-1"
                className="text-sm font-medium"
              >
                Address
              </label>

              <input
                id="address-line-1"
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
                htmlFor="address-line-2"
                className="text-sm font-medium"
              >
                Apartment, building or landmark

                <span className="ml-1 text-muted-foreground">
                  (optional)
                </span>
              </label>

              <input
                id="address-line-2"
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
                htmlFor="address-city"
                className="text-sm font-medium"
              >
                City
              </label>

              <input
                id="address-city"
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
                htmlFor="address-state"
                className="text-sm font-medium"
              >
                State / Union Territory
              </label>

              <select
                id="address-state"
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
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              {...register(
                "isDefault",
              )}
            />

            <span>
              Use as my default delivery address
            </span>
          </label>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={
                closeAddressForm
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}

              {isSubmitting
                ? "Saving..."
                : editingAddressId
                  ? "Update Address"
                  : "Save Address"}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="mt-6 flex min-h-52 items-center justify-center rounded-2xl border">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-red-600" />

            <p className="mt-3 text-sm text-muted-foreground">
              Loading your addresses...
            </p>
          </div>
        </div>
      ) : addresses.length > 0 ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {addresses.map(
            (address) => (
              <article
                key={address.id}
                className="rounded-2xl border bg-card p-6"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                      {address.label
                        ?.toLowerCase() ===
                      "home" ? (
                        <Home className="h-5 w-5" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        {address.label ??
                          "Address"}
                      </h2>

                      {address.isDefault && (
                        <p className="mt-1 text-xs font-medium text-green-700">
                          Default delivery address
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${
                        address.label ??
                        "address"
                      }`}
                      onClick={() =>
                        openEditAddressForm(
                          address,
                        )
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={
                        deletingAddressId ===
                        address.id
                      }
                      aria-label={`Delete ${
                        address.label ??
                        "address"
                      }`}
                      onClick={() => {
                        void removeAddress(
                          address.id,
                        );
                      }}
                    >
                      {deletingAddressId ===
                      address.id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <address className="mt-6 not-italic leading-7 text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {
                      address.recipientName
                    }
                  </p>

                  <p>
                    {
                      address.addressLine1
                    }
                  </p>

                  {address.addressLine2 && (
                    <p>
                      {
                        address.addressLine2
                      }
                    </p>
                  )}

                  <p>
                    {address.city},{" "}
                    {address.state}{" "}
                    {address.postalCode}
                  </p>

                  <p>{address.country}</p>

                  <p className="mt-2">
                    +91 {address.phone}
                  </p>
                </address>

                {!address.isDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-6"
                    disabled={
                      settingDefaultAddressId ===
                      address.id
                    }
                    onClick={() => {
                      void makeDefaultAddress(
                        address.id,
                      );
                    }}
                  >
                    {settingDefaultAddressId ===
                    address.id ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}

                    {settingDefaultAddressId ===
                    address.id
                      ? "Updating..."
                      : "Set as Default"}
                  </Button>
                )}
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed px-6 py-16 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />

          <h2 className="mt-5 text-xl font-semibold">
            No saved addresses
          </h2>

          <p className="mt-2 text-muted-foreground">
            Add a delivery address to make checkout faster.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={
              openNewAddressForm
            }
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      )}
    </div>
  );
}