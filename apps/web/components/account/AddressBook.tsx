"use client";

import { useState } from "react";

import {
  Home,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Address = {
  id: string;
  label: string;
  recipientName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
};

const initialAddresses: Address[] = [
  {
    id: "address-001",
    label: "Home",
    recipientName: "Tanmay Saini",
    addressLine1: "12, Example Residency",
    addressLine2: "Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560038",
    phone: "9876543210",
    isDefault: true,
  },
];

export default function AddressBook() {
  const [addresses, setAddresses] =
    useState<Address[]>(initialAddresses);

  function addExampleAddress() {
    const newAddress: Address = {
      id: crypto.randomUUID(),
      label: "Office",
      recipientName: "Tanmay Saini",
      addressLine1: "HotLap Business Centre",
      addressLine2: "Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560095",
      phone: "9876543210",
      isDefault: false,
    };

    setAddresses((currentAddresses) => [
      ...currentAddresses,
      newAddress,
    ]);
  }

  function removeAddress(addressId: string) {
    setAddresses((currentAddresses) =>
      currentAddresses.filter(
        (address) =>
          address.id !== addressId,
      ),
    );
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={addExampleAddress}
        >
          <Plus className="h-4 w-4" />
          Add Example Address
        </Button>
      </div>

      {addresses.length > 0 ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-2xl border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                    {address.label === "Home" ? (
                      <Home className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      {address.label}
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
                    aria-label={`Edit ${address.label} address`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${address.label} address`}
                    onClick={() =>
                      removeAddress(address.id)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <address className="mt-6 not-italic leading-7 text-muted-foreground">
                <p className="font-medium text-foreground">
                  {address.recipientName}
                </p>

                <p>{address.addressLine1}</p>
                <p>{address.addressLine2}</p>

                <p>
                  {address.city}, {address.state}{" "}
                  {address.postalCode}
                </p>

                <p className="mt-2">
                  +91 {address.phone}
                </p>
              </address>
            </article>
          ))}
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
        </div>
      )}
    </div>
  );
}