import CTAButtons from "@/components/shared/CTAButtons";

export default function HeroContent() {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
        🏁 Premium RC Store
      </span>

      <h1 className="mt-6 text-5xl font-extrabold leading-tight lg:text-7xl">
        Experience RC Racing
        <span className="block text-red-600">
          Like Never Before
        </span>
      </h1>

      <p className="mt-8 text-lg leading-8 text-gray-600">
        Shop premium remote controlled cars, original spare parts,
        3D printed accessories, and participate in exciting RC racing
        events—all in one place.
      </p>

      <CTAButtons />
    </div>
  );
}