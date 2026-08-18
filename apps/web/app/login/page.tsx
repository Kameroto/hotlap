import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your HotLap customer account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to HotLap"
      description="Access your wishlist, orders, delivery addresses, and account settings."
    >
      <LoginForm />
    </AuthShell>
  );
}
