import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your HotLap customer account.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join HotLap"
      title="Create your account"
      description="Save products, track purchases, and manage delivery addresses in one place."
    >
      <RegisterForm />
    </AuthShell>
  );
}
