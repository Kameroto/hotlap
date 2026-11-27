"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ProductDetailError({ reset }: { reset?: () => void }) {
  const router = useRouter();
  return (
    <main>
      <Section>
        <Container>
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-muted p-8 text-center">
            <h1 className="text-3xl font-bold">We couldn’t load this product</h1>
            <p className="mt-3 text-muted-foreground">Please try again or return to the catalogue.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={reset ?? (() => router.refresh())}>Try again</Button>
              <Link className={buttonVariants({ variant: "outline" })} href="/products">Browse Products</Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
