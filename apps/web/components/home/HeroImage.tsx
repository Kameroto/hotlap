export default function HeroImage() {
  return (
    <div className="relative flex h-[500px] items-center justify-center overflow-hidden rounded-3xl border bg-gradient-to-br from-red-50 via-white to-gray-100 shadow-xl">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-100 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-100 blur-3xl" />

      <div className="relative text-center">
        <div className="text-8xl">🏎️</div>

        <h3 className="mt-8 text-2xl font-bold">
          Premium RC Performance
        </h3>

        <p className="mt-3 max-w-xs text-gray-600">
          High-speed RC cars, precision parts, and race-ready accessories.
        </p>
      </div>
    </div>
  );
}