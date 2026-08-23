"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Home,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
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
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const maximumSavedAddresses = 5;

const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .max(
      50,
      "Address label must contain no more than 50 characters.",
    ),

  recipientName: z
    .string()
    .trim()
    .min(
      2,
      "Recipient name must contain at least 2 characters.",
    )
    .max(
      150,
      "Recipient name must contain no more than 150 characters.",
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
      "Enter a complete delivery address.",
    )
    .max(
      250,
      "Address line 1 must contain no more than 250 characters.",
    ),

  addressLine2: z
    .string()
    .trim()
    .max(
      250,
      "Address line 2 must contain no more than 250 characters.",
    ),

  city: z
    .string()
    .trim()
    .min(
      2,
      "City must contain at least 2 characters.",
    )
    .max(
      100,
      "City must contain no more than 100 characters.",
    ),

  state: z
    .string()
    .trim()
    .min(2, "Select the state or union territory.")
    .max(
      100,
      "State must contain no more than 100 characters.",
    ),

  postalCode: z
    .string()
    .trim()
    .regex(
      /^[1-9]\d{5}$/,
      "Enter a valid 6-digit Indian PIN code.",
    ),

  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<
  typeof addressSchema
>;

type AddressLoadStatus =
  | "loading"
  | "loaded"
  | "error";

type Operation =
  | "saving"
  | "deleting"
  | "default"
  | null;

type Feedback = {
  type: "success" | "error" | "warning";
  title: string;
  message: string;
} | null;

type EditorAction =
  | { type: "new" }
  | { type: "edit"; address: Address }
  | { type: "close" };

type FieldErrorMessageProps = {
  error?: FieldError;
  id: string;
};

function FieldErrorMessage({
  error,
  id,
}: FieldErrorMessageProps) {
  if (!error?.message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-sm text-destructive"
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0"
      />
      {error.message}
    </p>
  );
}

const inputClassName =
  "mt-2 h-12 w-full min-w-0 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/70 focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none aria-invalid:border-destructive/70 aria-invalid:ring-2 aria-invalid:ring-destructive/20";

const emptyFormValues: AddressFormValues = {
  label: "",
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
    label: values.label || null,
    recipientName: values.recipientName,
    phone: values.phone,
    addressLine1: values.addressLine1,
    addressLine2:
      values.addressLine2 || null,
    city: values.city,
    state: values.state,
    postalCode: values.postalCode,
    country: "India",
    isDefault: values.isDefault,
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

function sortAddresses(
  addresses: Address[],
): Address[] {
  return [...addresses].sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1;
    }

    return left.createdAt.localeCompare(
      right.createdAt,
    );
  });
}

function reconcileConfirmedAddress(
  addresses: Address[],
  confirmedAddress: Address,
): Address[] {
  const reconciled = addresses.map((address) =>
    address.id === confirmedAddress.id
      ? confirmedAddress
      : confirmedAddress.isDefault
        ? { ...address, isDefault: false }
        : address,
  );

  if (
    !reconciled.some(
      (address) =>
        address.id === confirmedAddress.id,
    )
  ) {
    reconciled.push(confirmedAddress);
  }

  return sortAddresses(reconciled);
}

export default function AddressBook() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);
  const [loadStatus, setLoadStatus] =
    useState<AddressLoadStatus>("loading");
  const [loadError, setLoadError] =
    useState<string | null>(null);
  const [formIsOpen, setFormIsOpen] =
    useState(false);
  const [editingAddressId, setEditingAddressId] =
    useState<string | null>(null);
  const [operation, setOperation] =
    useState<Operation>(null);
  const [operationTargetId, setOperationTargetId] =
    useState<string | null>(null);
  const [feedback, setFeedback] =
    useState<Feedback>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<Address | null>(null);
  const [pendingEditorAction, setPendingEditorAction] =
    useState<EditorAction | null>(null);

  const requestGenerationReference = useRef(0);
  const mutationInFlightReference = useRef(false);
  const editorHeadingReference =
    useRef<HTMLHeadingElement>(null);
  const addButtonReference =
    useRef<HTMLButtonElement>(null);
  const editorReturnFocusReference =
    useRef<HTMLElement | null>(null);
  const deleteReturnFocusReference =
    useRef<HTMLElement | null>(null);
  const deleteDialogReference =
    useRef<HTMLDialogElement>(null);
  const discardDialogReference =
    useRef<HTMLDialogElement>(null);

  const {
    register,
    reset,
    handleSubmit,

    formState: {
      errors,
      isDirty,
      isSubmitting,
    },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    const requestGeneration =
      ++requestGenerationReference.current;
    let requestIsActive = true;

    void getAccountAddresses()
      .then((response) => {
        if (
          !requestIsActive ||
          requestGeneration !==
            requestGenerationReference.current
        ) {
          return;
        }

        setAddresses(response.addresses);
        setLoadStatus("loaded");
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (
          !requestIsActive ||
          requestGeneration !==
            requestGenerationReference.current
        ) {
          return;
        }

        setLoadStatus("error");
        setLoadError(
          getErrorMessage(
            error,
            "Unable to load your saved addresses.",
          ),
        );
      });

    return () => {
      requestIsActive = false;
      requestGenerationReference.current += 1;
    };
  }, []);

  useEffect(() => {
    if (formIsOpen) {
      editorHeadingReference.current?.focus();
    }
  }, [formIsOpen, editingAddressId]);

  useEffect(() => {
    if (deleteTarget) {
      deleteDialogReference.current?.showModal();
    }
  }, [deleteTarget]);

  useEffect(() => {
    if (pendingEditorAction) {
      discardDialogReference.current?.showModal();
    }
  }, [pendingEditorAction]);

  async function loadAddresses(): Promise<void> {
    const requestGeneration =
      ++requestGenerationReference.current;
    setLoadStatus("loading");
    setLoadError(null);

    try {
      const response = await getAccountAddresses();

      if (
        requestGeneration !==
        requestGenerationReference.current
      ) {
        return;
      }

      setAddresses(response.addresses);
      setLoadStatus("loaded");
      setFeedback((currentFeedback) =>
        currentFeedback?.type === "warning"
          ? null
          : currentFeedback,
      );
    } catch (error) {
      if (
        requestGeneration !==
        requestGenerationReference.current
      ) {
        return;
      }

      setLoadStatus("error");
      setLoadError(
        getErrorMessage(
          error,
          "Unable to load your saved addresses.",
        ),
      );
    }
  }

  async function reconcileAfterMutation(
    successMessage: string,
  ): Promise<void> {
    const requestGeneration =
      ++requestGenerationReference.current;

    try {
      const response = await getAccountAddresses();

      if (
        requestGeneration !==
        requestGenerationReference.current
      ) {
        return;
      }

      setAddresses(response.addresses);
      setLoadStatus("loaded");
      setLoadError(null);
      setFeedback((currentFeedback) =>
        currentFeedback?.type === "warning"
          ? null
          : currentFeedback,
      );
    } catch {
      if (
        requestGeneration !==
        requestGenerationReference.current
      ) {
        return;
      }

      setFeedback({
        type: "warning",
        title: "Saved, but the list may be out of date",
        message: `${successMessage} HotLap could not refresh the full address list. Retry the list refresh before making another change.`,
      });
    }
  }

  function populateEditor(address: Address) {
    setEditingAddressId(address.id);
    reset({
      label: address.label ?? "",
      recipientName: address.recipientName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setFeedback(null);
    setFormIsOpen(true);
  }

  function populateNewEditor() {
    setEditingAddressId(null);
    reset({
      ...emptyFormValues,
      isDefault: addresses.length === 0,
    });
    setFeedback(null);
    setFormIsOpen(true);
  }

  function closeEditor() {
    setFormIsOpen(false);
    setEditingAddressId(null);
    reset(emptyFormValues);

    requestAnimationFrame(() => {
      editorReturnFocusReference.current?.focus();
      editorReturnFocusReference.current = null;
    });
  }

  function applyEditorAction(action: EditorAction) {
    if (action.type === "new") {
      populateNewEditor();
      return;
    }

    if (action.type === "edit") {
      populateEditor(action.address);
      return;
    }

    closeEditor();
  }

  function requestEditorAction(
    action: EditorAction,
    trigger?: HTMLElement,
  ) {
    if (mutationInFlightReference.current) {
      return;
    }

    if (
      action.type === "new" &&
      addresses.length >= maximumSavedAddresses
    ) {
      return;
    }

    if (trigger && action.type !== "close") {
      editorReturnFocusReference.current = trigger;
    }

    if (formIsOpen && isDirty) {
      setPendingEditorAction(action);
      return;
    }

    applyEditorAction(action);
  }

  function closeDiscardDialog(
    restoreFocus = true,
  ) {
    discardDialogReference.current?.close();
    setPendingEditorAction(null);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        editorReturnFocusReference.current?.focus();
      });
    }
  }

  async function saveAddress(
    values: AddressFormValues,
  ): Promise<void> {
    setOperation("saving");
    setFeedback(null);

    try {
      const request = toAddressRequest(values);
      const response = editingAddressId
        ? await updateAccountAddress(
            editingAddressId,
            request,
          )
        : await createAccountAddress(request);

      setAddresses((currentAddresses) =>
        reconcileConfirmedAddress(
          currentAddresses,
          response.address,
        ),
      );

      const successMessage = editingAddressId
        ? "The address was updated."
        : "The address was added.";

      setFeedback({
        type: "success",
        title: editingAddressId
          ? "Address updated"
          : "Address added",
        message: successMessage,
      });
      toast.success(successMessage);

      setFormIsOpen(false);
      setEditingAddressId(null);
      reset(emptyFormValues);

      requestAnimationFrame(() => {
        editorReturnFocusReference.current?.focus();
        editorReturnFocusReference.current = null;
      });

      await reconcileAfterMutation(successMessage);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to save the address. Please try again.",
      );

      setFeedback({
        type: "error",
        title: "Address not saved",
        message,
      });
      toast.error(message);
    } finally {
      mutationInFlightReference.current = false;
      setOperation(null);
    }
  }

  async function submitAddress(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    if (
      editingAddressId === null &&
      addresses.length >= maximumSavedAddresses
    ) {
      event.preventDefault();
      setFeedback({
        type: "error",
        title: "Address limit reached",
        message:
          "You can save up to 5 addresses. Delete an existing address to add another.",
      });
      return;
    }

    if (mutationInFlightReference.current) {
      event.preventDefault();
      return;
    }

    mutationInFlightReference.current = true;

    try {
      await handleSubmit(
        saveAddress,
        () => {
          mutationInFlightReference.current = false;
        },
      )(event);
    } catch (error) {
      mutationInFlightReference.current = false;
      throw error;
    }
  }

  async function makeDefaultAddress(
    addressId: string,
  ): Promise<void> {
    if (mutationInFlightReference.current) {
      return;
    }

    mutationInFlightReference.current = true;
    setOperation("default");
    setOperationTargetId(addressId);
    setFeedback(null);

    try {
      const response =
        await setAccountDefaultAddress(addressId);

      setAddresses((currentAddresses) =>
        reconcileConfirmedAddress(
          currentAddresses,
          response.address,
        ),
      );

      const successMessage =
        "The default address was updated.";
      setFeedback({
        type: "success",
        title: "Default updated",
        message: successMessage,
      });
      toast.success(successMessage);

      await reconcileAfterMutation(successMessage);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to update the default address.",
      );
      setFeedback({
        type: "error",
        title: "Default not updated",
        message,
      });
      toast.error(message);
    } finally {
      mutationInFlightReference.current = false;
      setOperation(null);
      setOperationTargetId(null);
    }
  }

  function requestDelete(
    address: Address,
    trigger: HTMLElement,
  ) {
    if (mutationInFlightReference.current) {
      return;
    }

    deleteReturnFocusReference.current = trigger;
    setDeleteTarget(address);
  }

  function closeDeleteDialog(
    restoreFocus = true,
  ) {
    deleteDialogReference.current?.close();
    setDeleteTarget(null);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        deleteReturnFocusReference.current?.focus();
      });
    }
  }

  async function confirmDelete(): Promise<void> {
    if (
      !deleteTarget ||
      mutationInFlightReference.current
    ) {
      return;
    }

    mutationInFlightReference.current = true;
    setOperation("deleting");
    setFeedback(null);

    const addressBeingDeleted = deleteTarget;

    try {
      await deleteAccountAddress(
        addressBeingDeleted.id,
      );

      setAddresses((currentAddresses) =>
        currentAddresses.filter(
          (address) =>
            address.id !== addressBeingDeleted.id,
        ),
      );

      const successMessage =
        "The address was deleted.";
      setFeedback({
        type: "success",
        title: "Address deleted",
        message: successMessage,
      });
      toast.success(successMessage);

      deleteReturnFocusReference.current =
        addButtonReference.current;
      closeDeleteDialog(true);

      await reconcileAfterMutation(successMessage);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to delete the address.",
      );
      setFeedback({
        type: "error",
        title: "Address not deleted",
        message,
      });
      toast.error(message);
      closeDeleteDialog(true);
    } finally {
      mutationInFlightReference.current = false;
      setOperation(null);
    }
  }

  const editorIsCurrentDefault =
    editingAddressId !== null &&
    addresses.some(
      (address) =>
        address.id === editingAddressId &&
        address.isDefault,
    );
  const editorIsFirstAddress =
    editingAddressId === null &&
    addresses.length === 0;
  const interfaceIsBusy = operation !== null;
  const addressLimitHasBeenReached =
    addresses.length >= maximumSavedAddresses;
  const addressChangesAreDisabled =
    interfaceIsBusy || feedback?.type === "warning";
  const storedEditorState = editingAddressId
    ? addresses.find(
        (address) =>
          address.id === editingAddressId,
      )?.state
    : undefined;
  const storedEditorStateNeedsOption =
    Boolean(storedEditorState) &&
    !indianStates.includes(
      storedEditorState as string,
    );

  const fieldIds = {
    labelHelp: "address-label-help",
    labelError: "address-label-error",
    recipientError: "address-recipient-error",
    phoneHelp: "address-phone-help",
    phoneError: "address-phone-error",
    postalHelp: "address-postal-help",
    postalError: "address-postal-error",
    line1Error: "address-line-1-error",
    line2Help: "address-line-2-help",
    line2Error: "address-line-2-error",
    cityError: "address-city-error",
    stateError: "address-state-error",
    defaultHelp: "address-default-help",
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          Saved addresses are available when choosing order details.
        </p>
        <Button
          ref={addButtonReference}
          type="button"
          size="lg"
          disabled={
            addressChangesAreDisabled ||
            loadStatus !== "loaded" ||
            addressLimitHasBeenReached
          }
          aria-describedby={
            addressLimitHasBeenReached
              ? "address-limit-message"
              : undefined
          }
          className="w-full sm:w-auto"
          onClick={(event) => {
            requestEditorAction(
              { type: "new" },
              event.currentTarget,
            );
          }}
        >
          <Plus aria-hidden="true" className="size-4" />
          Add Address
        </Button>
      </div>

      {loadStatus === "loaded" &&
        addressLimitHasBeenReached && (
          <p
            id="address-limit-message"
            role="status"
            className="mt-3 text-sm leading-6 text-muted-foreground"
          >
            You can save up to 5 addresses. Delete an existing address to add another.
          </p>
        )}

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live={feedback.type === "error" ? "assertive" : "polite"}
          className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            feedback.type === "error"
              ? "border-destructive/35 bg-destructive/10 text-destructive"
              : feedback.type === "warning"
                ? "border-amber-500/35 bg-amber-500/10 text-amber-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          ) : feedback.type === "warning" ? (
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold">{feedback.title}</p>
            <p className="mt-1 break-words leading-6 opacity-85">
              {feedback.message}
            </p>
            {feedback.type === "warning" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={interfaceIsBusy}
                className="mt-3"
                onClick={() =>
                  void reconcileAfterMutation(
                    "The previous address change was confirmed.",
                  )
                }
              >
                <RefreshCw aria-hidden="true" className="size-4" />
                Refresh List
              </Button>
            )}
          </div>
        </div>
      )}

      {formIsOpen && (
        <form
          onSubmit={submitAddress}
          onChange={() => {
            if (feedback?.type === "success") {
              setFeedback(null);
            }
          }}
          noValidate
          aria-busy={operation === "saving" || isSubmitting}
          className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-card/90 shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
        >
          <div className="flex min-w-0 items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-5 py-5 sm:px-7">
            <div className="min-w-0">
              <h2
                ref={editorHeadingReference}
                tabIndex={-1}
                className="break-words text-xl font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {editingAddressId ? "Edit Address" : "Add Address"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Enter an Indian address. Fields marked required must be completed.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label="Close address editor"
              disabled={interfaceIsBusy}
              onClick={(event) => {
                requestEditorAction(
                  { type: "close" },
                  event.currentTarget,
                );
              }}
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid min-w-0 gap-6 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="address-label" className="text-sm font-medium">
                  Label <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="address-label"
                  autoComplete="off"
                  placeholder="Home or Office"
                  aria-invalid={errors.label ? true : undefined}
                  aria-describedby={errors.label ? `${fieldIds.labelHelp} ${fieldIds.labelError}` : fieldIds.labelHelp}
                  className={inputClassName}
                  {...register("label")}
                />
                <p id={fieldIds.labelHelp} className="mt-2 text-xs leading-5 text-muted-foreground">
                  A short name to help you identify this address.
                </p>
                <FieldErrorMessage id={fieldIds.labelError} error={errors.label} />
              </div>

              <div className="min-w-0">
                <label htmlFor="address-recipient" className="text-sm font-medium">
                  Recipient name <span className="text-primary">(required)</span>
                </label>
                <input
                  id="address-recipient"
                  autoComplete="name"
                  aria-invalid={errors.recipientName ? true : undefined}
                  aria-describedby={errors.recipientName ? fieldIds.recipientError : undefined}
                  className={inputClassName}
                  {...register("recipientName")}
                />
                <FieldErrorMessage id={fieldIds.recipientError} error={errors.recipientName} />
              </div>

              <div className="min-w-0">
                <label htmlFor="address-phone" className="text-sm font-medium">
                  Mobile number <span className="text-primary">(required)</span>
                </label>
                <input
                  id="address-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10-digit Indian mobile number"
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? `${fieldIds.phoneHelp} ${fieldIds.phoneError}` : fieldIds.phoneHelp}
                  className={inputClassName}
                  {...register("phone")}
                />
                <p id={fieldIds.phoneHelp} className="mt-2 text-xs leading-5 text-muted-foreground">
                  Enter 10 digits beginning with 6–9.
                </p>
                <FieldErrorMessage id={fieldIds.phoneError} error={errors.phone} />
              </div>

              <div className="min-w-0">
                <label htmlFor="address-postal-code" className="text-sm font-medium">
                  PIN code <span className="text-primary">(required)</span>
                </label>
                <input
                  id="address-postal-code"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-invalid={errors.postalCode ? true : undefined}
                  aria-describedby={errors.postalCode ? `${fieldIds.postalHelp} ${fieldIds.postalError}` : fieldIds.postalHelp}
                  className={inputClassName}
                  {...register("postalCode")}
                />
                <p id={fieldIds.postalHelp} className="mt-2 text-xs leading-5 text-muted-foreground">
                  Enter a 6-digit Indian PIN code.
                </p>
                <FieldErrorMessage id={fieldIds.postalError} error={errors.postalCode} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label htmlFor="address-line-1" className="text-sm font-medium">
                  Address line 1 <span className="text-primary">(required)</span>
                </label>
                <input
                  id="address-line-1"
                  autoComplete="address-line1"
                  aria-invalid={errors.addressLine1 ? true : undefined}
                  aria-describedby={errors.addressLine1 ? fieldIds.line1Error : undefined}
                  className={inputClassName}
                  {...register("addressLine1")}
                />
                <FieldErrorMessage id={fieldIds.line1Error} error={errors.addressLine1} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label htmlFor="address-line-2" className="text-sm font-medium">
                  Address line 2 <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="address-line-2"
                  autoComplete="address-line2"
                  placeholder="Apartment, building or landmark"
                  aria-invalid={errors.addressLine2 ? true : undefined}
                  aria-describedby={errors.addressLine2 ? `${fieldIds.line2Help} ${fieldIds.line2Error}` : fieldIds.line2Help}
                  className={inputClassName}
                  {...register("addressLine2")}
                />
                <p id={fieldIds.line2Help} className="mt-2 text-xs leading-5 text-muted-foreground">
                  Blank values are saved as no second address line.
                </p>
                <FieldErrorMessage id={fieldIds.line2Error} error={errors.addressLine2} />
              </div>

              <div className="min-w-0">
                <label htmlFor="address-city" className="text-sm font-medium">
                  City <span className="text-primary">(required)</span>
                </label>
                <input
                  id="address-city"
                  autoComplete="address-level2"
                  aria-invalid={errors.city ? true : undefined}
                  aria-describedby={errors.city ? fieldIds.cityError : undefined}
                  className={inputClassName}
                  {...register("city")}
                />
                <FieldErrorMessage id={fieldIds.cityError} error={errors.city} />
              </div>

              <div className="min-w-0">
                <label htmlFor="address-state" className="text-sm font-medium">
                  State / Union Territory <span className="text-primary">(required)</span>
                </label>
                <select
                  id="address-state"
                  autoComplete="address-level1"
                  aria-invalid={errors.state ? true : undefined}
                  aria-describedby={errors.state ? fieldIds.stateError : undefined}
                  className={`${inputClassName} bg-[#0b0e11] text-foreground [color-scheme:dark] [&>option]:bg-[#101316] [&>option]:text-foreground`}
                  {...register("state")}
                >
                  <option
                    value=""
                    className="bg-[#101316] text-muted-foreground"
                  >
                    Select state or union territory
                  </option>
                  {storedEditorStateNeedsOption && (
                    <option value={storedEditorState}>
                      {storedEditorState}
                    </option>
                  )}
                  {indianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <FieldErrorMessage id={fieldIds.stateError} error={errors.state} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4">
              {editorIsCurrentDefault || editorIsFirstAddress ? (
                <>
                  <input type="hidden" {...register("isDefault")} />
                  <div className="flex items-start gap-3">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {editorIsFirstAddress ? "This will be your default address" : "This is your current default address"}
                      </p>
                      <p id={fieldIds.defaultHelp} className="mt-1 text-sm leading-6 text-muted-foreground">
                        {editorIsFirstAddress
                          ? "The backend automatically makes the first saved address the default."
                          : "Choose Set as Default on another saved address before this one can stop being the default."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    aria-describedby={fieldIds.defaultHelp}
                    className="mt-1 size-5 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    {...register("isDefault")}
                  />
                  <span>
                    <span className="font-semibold">Use as my default address</span>
                    <span id={fieldIds.defaultHelp} className="mt-1 block leading-6 text-muted-foreground">
                      HotLap confirms the default change with the server after saving.
                    </span>
                  </span>
                </label>
              )}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {operation === "saving"
                  ? "Saving the address…"
                  : isDirty
                    ? "You have unsaved changes."
                    : "No unsaved changes."}
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={interfaceIsBusy}
                  onClick={(event) => {
                    requestEditorAction({ type: "close" }, event.currentTarget);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    !isDirty ||
                    interfaceIsBusy ||
                    isSubmitting ||
                    (editingAddressId === null &&
                      addressLimitHasBeenReached)
                  }
                >
                  {operation === "saving" || isSubmitting ? (
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                  ) : (
                    <Check aria-hidden="true" className="size-4" />
                  )}
                  {operation === "saving" || isSubmitting
                    ? "Saving…"
                    : editingAddressId
                      ? "Update Address"
                      : "Save Address"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {loadStatus === "loading" ? (
        <div role="status" aria-live="polite" className="mt-6 flex min-h-56 items-center justify-center rounded-3xl border border-white/10 bg-card/70 p-8">
          <div className="text-center">
            <LoaderCircle aria-hidden="true" className="mx-auto size-7 animate-spin text-primary motion-reduce:animate-none" />
            <p className="mt-4 text-sm text-muted-foreground">Loading your saved addresses…</p>
          </div>
        </div>
      ) : loadStatus === "error" ? (
        <div role="alert" className="mt-6 rounded-3xl border border-destructive/35 bg-destructive/10 px-6 py-10 text-center sm:px-8">
          <AlertCircle aria-hidden="true" className="mx-auto size-9 text-destructive" />
          <h2 className="mt-5 text-xl font-semibold">Addresses could not be loaded</h2>
          <p className="mx-auto mt-2 max-w-xl break-words text-sm leading-6 text-muted-foreground">
            {loadError ?? "Unable to load your saved addresses."}
          </p>
          <Button type="button" size="lg" className="mt-6" onClick={() => void loadAddresses()}>
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry
          </Button>
        </div>
      ) : addresses.length > 0 ? (
        <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-card/90 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)] sm:p-6">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    {address.label?.toLowerCase() === "home" ? (
                      <Home aria-hidden="true" className="size-5" />
                    ) : (
                      <MapPin aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="break-words font-semibold">{address.label || "Saved Address"}</h2>
                    {address.isDefault && (
                      <span className="mt-2 inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-primary">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    disabled={addressChangesAreDisabled}
                    aria-label={`Edit ${address.label || "saved address"}`}
                    onClick={(event) => {
                      requestEditorAction({ type: "edit", address }, event.currentTarget);
                    }}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    disabled={addressChangesAreDisabled}
                    aria-label={`Delete ${address.label || "saved address"}`}
                    onClick={(event) => requestDelete(address, event.currentTarget)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </div>

              <address className="mt-6 min-w-0 flex-1 not-italic text-sm leading-7 text-muted-foreground">
                <p className="break-words font-medium text-foreground">{address.recipientName}</p>
                <p className="break-words">{address.addressLine1}</p>
                {address.addressLine2 && <p className="break-words">{address.addressLine2}</p>}
                <p className="break-words">{address.city}, {address.state} {address.postalCode}</p>
                <p className="break-words">{address.country}</p>
                <p className="mt-2 break-all">+91 {address.phone}</p>
              </address>

              {!address.isDefault && (
                <div className="mt-6 border-t border-white/10 pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={addressChangesAreDisabled}
                    className="w-full sm:w-auto"
                    onClick={() => void makeDefaultAddress(address.id)}
                  >
                    {operation === "default" &&
                    operationTargetId === address.id ? (
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                    ) : (
                      <Check aria-hidden="true" className="size-4" />
                    )}
                    {operation === "default" &&
                    operationTargetId === address.id
                      ? "Updating…"
                      : "Set as Default"}
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-primary/25 bg-gradient-to-br from-card/90 to-primary/[0.04] px-6 py-14 text-center sm:py-16">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
            <MapPin aria-hidden="true" className="size-7" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">No saved addresses</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Add your first address. The backend will make it your default automatically.
          </p>
          <Button
            type="button"
            size="lg"
            disabled={addressChangesAreDisabled}
            className="mt-6 w-full sm:w-auto"
            onClick={(event) => requestEditorAction({ type: "new" }, event.currentTarget)}
          >
            <Plus aria-hidden="true" className="size-4" />
            Add Your First Address
          </Button>
        </div>
      )}

      <dialog
        ref={deleteDialogReference}
        aria-labelledby="delete-address-title"
        aria-describedby="delete-address-description"
        aria-busy={operation === "deleting"}
        onCancel={(event) => {
          if (operation === "deleting") {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          closeDeleteDialog(true);
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-7">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 aria-hidden="true" className="size-5" />
          </span>
          <h2 id="delete-address-title" className="mt-5 break-words text-xl font-semibold">
            Delete {deleteTarget?.label || "this saved address"}?
          </h2>
          <p id="delete-address-description" className="mt-3 break-words text-sm leading-6 text-muted-foreground">
            {deleteTarget?.recipientName ? `${deleteTarget.recipientName} — ${deleteTarget.addressLine1}. ` : ""}
            This removes the address from your account. If it is the default, the backend will choose the next saved address.
          </p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              autoFocus
              type="button"
              variant="outline"
              size="lg"
              disabled={operation === "deleting"}
              onClick={() => closeDeleteDialog(true)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              disabled={operation === "deleting"}
              onClick={() => void confirmDelete()}
            >
              {operation === "deleting" ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Trash2 aria-hidden="true" className="size-4" />
              )}
              {operation === "deleting" ? "Deleting…" : "Delete Address"}
            </Button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={discardDialogReference}
        aria-labelledby="discard-address-title"
        aria-describedby="discard-address-description"
        onCancel={(event) => {
          event.preventDefault();
          closeDiscardDialog(true);
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-7">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </span>
          <h2 id="discard-address-title" className="mt-5 text-xl font-semibold">Discard unsaved changes?</h2>
          <p id="discard-address-description" className="mt-3 text-sm leading-6 text-muted-foreground">
            The information currently entered in the address editor has not been saved.
          </p>
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button autoFocus type="button" variant="outline" size="lg" onClick={() => closeDiscardDialog(true)}>
              Keep Editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={() => {
                const action = pendingEditorAction;
                closeDiscardDialog(false);
                if (action) {
                  applyEditorAction(action);
                }
              }}
            >
              Discard Changes
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
