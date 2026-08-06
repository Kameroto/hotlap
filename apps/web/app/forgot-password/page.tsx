import type { Metadata } from "next";

import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Request a HotLap password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email and we’ll send password reset instructions once the backend email service is connected."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}