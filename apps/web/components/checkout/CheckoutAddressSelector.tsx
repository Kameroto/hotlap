import Link from "next/link";

import {
  AlertTriangle,
  Check,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import type {
  Address,
} from "@/lib/api/types";

import {
  cn,
} from "@/lib/utils";

type CheckoutAddressSelectorProps = {
  addresses: Address[];
  selectedAddressId: string | null;
  manualAddressIsSelected: boolean;
  isLoading: boolean;
  error: string | null;
  selectionError?: string;
  onSelectAddress: (
    addressId: string,
  ) => void;
  onSelectManualAddress: () => void;
  onRetry: () => void;
};

export default function CheckoutAddressSelector({
  addresses,
  selectedAddressId,
  manualAddressIsSelected,
  isLoading,
  error,
  selectionError,
  onSelectAddress,
  onSelectManualAddress,
  onRetry,
}: CheckoutAddressSelectorProps) {
  return (
    <section
      aria-labelledby="checkout-address-heading"
      className="rounded-2xl border border-white/10 bg-[#101316] p-5 shadow-[0_16px_45px_rgba(0,0,0,0.2)] sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="hotlap-kicker">
            Delivery
          </p>
          <h2
            id="checkout-address-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-foreground"
          >
            Delivery Address
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose a saved address or enter a different one for this order.
          </p>
        </div>

        <Link
          href="/account/addresses"
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "sm",
            }),
            "shrink-0 border-white/12",
          )}
        >
          Manage Addresses
        </Link>
      </div>

      {isLoading ? (
        <div
          role="status"
          className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-4 animate-spin text-primary motion-reduce:animate-none" />
          Loading saved addresses...
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Delivery address"
          aria-describedby={
            selectionError
              ? "checkout-address-selection-error"
              : undefined
          }
          className="mt-6 grid gap-3"
        >
          {error && (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/[0.055] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex gap-2.5">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-5 text-muted-foreground">
                  {error} You can still enter an address manually.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="shrink-0"
              >
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          )}

          {addresses.map((address) => {
            const isSelected =
              !manualAddressIsSelected &&
              selectedAddressId ===
                address.id;

            return (
              <label
                key={address.id}
                className={cn(
                  "relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background motion-reduce:transition-none",
                  isSelected
                    ? "border-primary/55 bg-primary/[0.07]"
                    : "border-white/10 bg-black/15 hover:border-white/20",
                )}
              >
                <input
                  type="radio"
                  name="checkout-address-choice"
                  value={address.id}
                  checked={isSelected}
                  onChange={() => {
                    onSelectAddress(
                      address.id,
                    );
                  }}
                  className="sr-only"
                />

                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-primary">
                  {isSelected ? (
                    <Check className="size-4" />
                  ) : (
                    <MapPin className="size-4" />
                  )}
                </span>

                <span className="min-w-0 text-sm">
                  <span className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                    {address.label ??
                      "Saved Address"}
                    {address.isDefault && (
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-primary">
                        Default
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-foreground">
                    {address.recipientName} · {address.phone}
                  </span>
                  <span className="mt-1 block leading-5 text-muted-foreground">
                    {address.addressLine1}
                    {address.addressLine2
                      ? `, ${address.addressLine2}`
                      : ""}
                    , {address.city}, {address.state} {address.postalCode}
                  </span>
                </span>
              </label>
            );
          })}

          <label
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background motion-reduce:transition-none",
              manualAddressIsSelected
                ? "border-primary/55 bg-primary/[0.07]"
                : "border-white/10 bg-black/15 hover:border-white/20",
            )}
          >
            <input
              type="radio"
              name="checkout-address-choice"
              value="manual"
              checked={manualAddressIsSelected}
              onChange={onSelectManualAddress}
              className="sr-only"
            />
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-primary">
              <Plus className="size-4" />
            </span>
            <span>
              <span className="block font-semibold text-foreground">
                Enter a different address
              </span>
              <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                Use an address for this order without changing your saved address book.
              </span>
            </span>
          </label>
        </div>
      )}

      {selectionError && (
        <p
          id="checkout-address-selection-error"
          role="alert"
          className="mt-3 text-sm text-destructive"
        >
          {selectionError}
        </p>
      )}
    </section>
  );
}
