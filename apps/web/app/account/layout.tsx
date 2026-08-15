import type { ReactNode } from "react";

import AccountNavigation from "@/components/account/AccountNavigation";
import AccountGuard from "@/components/auth/AccountGuard";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

type AccountLayoutProps = {
  children: ReactNode;
};

export default function AccountLayout({
  children,
}: AccountLayoutProps) {
  return (
    <AccountGuard>
      <main className="min-w-0 overflow-x-clip">
        <Section>
          <Container>
            <div className="grid w-full min-w-0 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
              <AccountNavigation />

              <div className="w-full min-w-0">
                {children}
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </AccountGuard>
  );
}
