import type { ReactNode } from "react";

import AccountNavigation from "@/components/account/AccountNavigation";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";

type AccountLayoutProps = {
  children: ReactNode;
};

export default function AccountLayout({
  children,
}: AccountLayoutProps) {
  return (
    <main>
      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <AccountNavigation />

            <div className="min-w-0">
              {children}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}