import Image from "next/image";

const developmentArtwork =
  "/images/home/hotlap-performance-rc-car-dev.png";

export default function HeroImage() {
  return (
    <div className="order-2 block w-full min-w-0 max-w-full self-auto px-2 sm:px-0 lg:order-none lg:self-center">
      <div className="mx-auto w-full min-w-0 max-w-[820px] overflow-hidden lg:mr-0">
        <Image
          src={developmentArtwork}
          alt="AI-generated development artwork of a performance RC sports car"
          width={1401}
          height={1123}
          priority
          sizes="(max-width: 640px) calc(100vw - 56px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1440px) 56vw, 820px"
          className="block h-auto w-full max-w-full object-contain"
        />
      </div>
    </div>
  );
}
