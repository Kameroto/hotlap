import type { Metadata } from "next";

import AddressBook from "@/components/account/AddressBook";

export const metadata: Metadata = {
  title: "Addresses",
  description:
    "Manage your HotLap delivery addresses.",
};

export default function AddressesPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Delivery Details
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Address Book
      </h1>

      <p className="mt-4 text-muted-foreground">
        Manage the delivery addresses available during checkout.
      </p>

      <div className="mt-10">
        <AddressBook />
      </div>
    </div>
  );
}