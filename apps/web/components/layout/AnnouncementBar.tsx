import Link from "next/link";

import Container from "@/components/layout/Container";

export default function AnnouncementBar() {
  return (
    <div className="border-b border-primary/20 bg-[#101316]">
      <Container>
        <Link
          href="/shipping"
          className="mx-auto flex min-h-[var(--hotlap-announcement-height)] w-fit max-w-full items-center justify-center px-1 text-center text-xs font-semibold leading-4 text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary motion-reduce:transition-none"
        >
          Free standard delivery on eligible orders ₹5,000+
        </Link>
      </Container>
    </div>
  );
}
