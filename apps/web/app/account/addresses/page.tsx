import type { Metadata } from "next";

import {
  MapPinned,
  ShieldCheck,
} from "lucide-react";

import AddressBook from "@/components/account/AddressBook";

export const metadata: Metadata = {
  title: "Addresses",
  description:
    "Manage your HotLap delivery addresses.",
};

export default function AddressesPage() {
  return (
    <div className="relative min-w-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-0 size-56 rounded-full bg-primary/8 blur-3xl"
      />

      <div className="relative min-w-0">
        <div className="flex items-center gap-2 text-[0.875rem] font-semibold uppercase tracking-[0.2em] text-primary">
          <MapPinned
            aria-hidden="true"
            className="size-4"
          />
          Address Book
        </div>

        <h1 className="mt-3 break-words text-4xl font-bold tracking-tight sm:text-5xl">
          Saved Addresses
        </h1>

        <div className="mt-4 flex max-w-2xl items-start gap-3 text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-primary"
          />
          <p className="break-words leading-7">
            Add and manage the addresses connected to your HotLap account. Default changes are confirmed by the server.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <AddressBook />
        </div>
      </div>
    </div>
  );
}
