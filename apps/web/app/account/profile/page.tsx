import type { Metadata } from "next";

import ProfileForm from "@/components/account/ProfileForm";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Manage your HotLap customer profile.",
};

export default function ProfilePage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
        Personal Information
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        Your Profile
      </h1>

      <p className="mt-4 text-muted-foreground">
        Update the contact information associated with your HotLap account.
      </p>

      <div className="mt-10">
        <ProfileForm />
      </div>
    </div>
  );
}