import Link from "next/link";
import Container from "./Container";

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide text-red-600"
          >
            HotLap
          </Link>

          <div className="hidden gap-8 md:flex">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/events">Events</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}