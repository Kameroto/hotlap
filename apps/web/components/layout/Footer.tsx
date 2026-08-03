import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t py-8">
      <Container>
        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} HotLap. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}