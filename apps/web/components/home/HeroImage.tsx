import Image from "next/image";

const developmentArtwork =
  "/images/home/hotlap-performance-rc-car-dev.png";

export default function HeroImage() {
  return (
    <div className="relative mx-auto w-full max-w-[760px] lg:mx-0">
      <div
        aria-hidden="true"
        className="absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-[100px]"
      />

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0c0f12] shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
        <Image
          src={developmentArtwork}
          alt="AI-generated development artwork of a performance RC sports car"
          width={1401}
          height={1123}
          priority
          sizes="(max-width: 1024px) 100vw, 53vw"
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}
