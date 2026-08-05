import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "prod-001",
    slug: "mjx-hyper-go-14301",
    name: "MJX Hyper Go 14301",
    shortDescription:
      "High-speed 1:14 scale brushless RC car built for aggressive driving.",
    description:
      "The MJX Hyper Go 14301 is a powerful 4WD brushless RC car designed for speed, durability, and exciting all-terrain performance.",
    brand: "MJX",
    category: "rc-cars",
    price: 12999,
    compareAtPrice: 14999,
    currency: "INR",
    sku: "HL-MJX-14301",
    stockQuantity: 8,
    rating: 4.8,
    reviewCount: 42,
    featured: true,
    badges: ["featured", "sale", "best-seller"],
    images: [
  {
    id: "img-001",
    url: "/products/mjx-hyper-go-14301.jpg",
    alt: "MJX Hyper Go 14301",
  },
],
    specifications: {
      Scale: "1:14",
      Drivetrain: "4WD",
      Motor: "Brushless",
      Battery: "2S LiPo",
      "Top Speed": "45 km/h",
    },
  },
  {
    id: "prod-002",
    slug: "wltoys-124019",
    name: "WLtoys 124019",
    shortDescription:
      "A capable 1:12 scale off-road buggy with strong suspension performance.",
    description:
      "The WLtoys 124019 offers a balanced combination of speed, stability, and off-road capability for enthusiasts looking for an affordable performance buggy.",
    brand: "WLtoys",
    category: "rc-cars",
    price: 9999,
    currency: "INR",
    sku: "HL-WLT-124019",
    stockQuantity: 5,
    rating: 4.6,
    reviewCount: 28,
    featured: true,
    badges: ["featured"],
    images: [
  {
    id: "img-002",
    url: "/products/wltoys-124019.jpg",
    alt: "WLtoys 124019",
  },
],
    specifications: {
      Scale: "1:12",
      Drivetrain: "4WD",
      Motor: "Brushed",
      Battery: "2S LiPo",
      "Top Speed": "55 km/h",
    },
  },
  {
    id: "prod-003",
    slug: "hardcase-lipo-battery-5200mah",
    name: "Hardcase LiPo Battery 5200mAh",
    shortDescription:
      "High-capacity 2S LiPo battery designed for longer RC driving sessions.",
    description:
      "A durable hardcase LiPo battery offering stable power delivery and extended runtime for compatible RC cars.",
    brand: "HotLap Power",
    category: "batteries-chargers",
    price: 3499,
    currency: "INR",
    sku: "HL-BAT-2S-5200",
    stockQuantity: 14,
    rating: 4.5,
    reviewCount: 19,
    featured: false,
    badges: ["new"],
    images: [
  {
    id: "img-003",
    url: "/products/lipo-battery-5200mah.jpg",
    alt: "Hardcase LiPo Battery 5200mAh",
  },
],
    specifications: {
      Voltage: "7.4V",
      Capacity: "5200mAh",
      Discharge: "50C",
      Connector: "XT60",
      Case: "Hardcase",
    },
  },
  {
    id: "prod-004",
    slug: "adjustable-rc-car-stand",
    name: "Adjustable RC Car Stand",
    shortDescription:
      "A sturdy 3D printed maintenance stand for RC cars and trucks.",
    description:
      "This adjustable maintenance stand is designed and 3D printed by HotLap to make repairs, cleaning, and display easier.",
    brand: "HotLap 3D",
    category: "3d-printed-accessories",
    price: 899,
    currency: "INR",
    sku: "HL-3D-STAND-001",
    stockQuantity: 20,
    rating: 4.7,
    reviewCount: 12,
    featured: true,
    badges: ["new", "featured"],
    images: [
  {
    id: "img-004",
    url: "/products/adjustable-rc-stand.jpg",
    alt: "Adjustable RC Car Stand",
  },
],
    specifications: {
      Material: "PETG",
      Compatibility: "1:10 to 1:16 scale",
      Finish: "Matte",
      Adjustable: "Yes",
    },
  },
];