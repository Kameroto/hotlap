import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  PrismaClient,
  ProductStatus,
} from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to seed the database.",
  );
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function seed(): Promise<void> {
  const rcCarsCategory =
    await prisma.category.upsert({
      where: {
        slug: "rc-cars",
      },

      update: {
        name: "RC Cars",
        isActive: true,
      },

      create: {
        name: "RC Cars",
        slug: "rc-cars",
        description:
          "Performance RC cars, buggies, trucks and drift vehicles.",
        sortOrder: 1,
      },
    });

  const batteriesCategory =
    await prisma.category.upsert({
      where: {
        slug: "batteries-chargers",
      },

      update: {
        name: "Batteries & Chargers",
        isActive: true,
      },

      create: {
        name: "Batteries & Chargers",
        slug: "batteries-chargers",
        description:
          "LiPo batteries, chargers and power accessories.",
        sortOrder: 2,
      },
    });

  const accessoriesCategory =
    await prisma.category.upsert({
      where: {
        slug: "3d-printed-accessories",
      },

      update: {
        name: "3D Printed Accessories",
        isActive: true,
      },

      create: {
        name: "3D Printed Accessories",
        slug: "3d-printed-accessories",
        description:
          "Custom 3D printed stands and RC accessories.",
        sortOrder: 3,
      },
    });

  await prisma.product.upsert({
    where: {
      slug: "mjx-hyper-go-14301",
    },

    update: {
      stockQuantity: 8,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },

    create: {
      categoryId: rcCarsCategory.id,
      name: "MJX Hyper Go 14301",
      slug: "mjx-hyper-go-14301",
      sku: "HL-MJX-14301",
      brand: "MJX",
      shortDescription:
        "High-performance brushless RC truck built for speed and durability.",
      description:
        "A powerful brushless RC vehicle designed for high-speed driving, jumps and demanding terrain.",
      price: "12999.00",
      compareAtPrice: "14999.00",
      stockQuantity: 8,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      ratingAverage: "4.80",
      reviewCount: 42,
      badges: ["new", "featured"],
      specifications: {
        scale: "1:14",
        motor: "Brushless",
        drivetrain: "4WD",
        topSpeed: "Approximately 55 km/h",
      },

      images: {
        create: [
          {
            url: "/products/mjx-hyper-go-14301-01-primary.webp",
            alt: "Generic development image for MJX Hyper Go 14301",
            isPrimary: true,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: {
      slug: "wltoys-124019",
    },

    update: {
      stockQuantity: 5,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },

    create: {
      categoryId: rcCarsCategory.id,
      name: "WLtoys 124019",
      slug: "wltoys-124019",
      sku: "HL-WLT-124019",
      brand: "WLtoys",
      shortDescription:
        "Metal-chassis 4WD RC buggy for fast off-road driving.",
      description:
        "A durable 1:12 scale RC buggy with a metal chassis and capable four-wheel-drive system.",
      price: "9999.00",
      stockQuantity: 5,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      ratingAverage: "4.60",
      reviewCount: 31,
      badges: ["featured", "best-seller"],
      specifications: {
        scale: "1:12",
        drivetrain: "4WD",
        chassis: "Metal",
        category: "Off-road buggy",
      },

      images: {
        create: [
          {
            url: "/products/wltoys-124019-01-primary.webp",
            alt: "Generic development image for WLtoys 124019",
            isPrimary: true,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: {
      slug: "hardcase-lipo-battery-5200mah",
    },

    update: {
      stockQuantity: 20,
      status: ProductStatus.ACTIVE,
    },

    create: {
      categoryId: batteriesCategory.id,
      name: "Hardcase LiPo Battery 5200mAh",
      slug: "hardcase-lipo-battery-5200mah",
      sku: "HL-BAT-5200",
      brand: "HotLap Power",
      shortDescription:
        "High-capacity hardcase LiPo battery for compatible RC vehicles.",
      description:
        "A durable hardcase LiPo battery designed to provide consistent power during extended RC sessions.",
      price: "3499.00",
      stockQuantity: 20,
      status: ProductStatus.ACTIVE,
      ratingAverage: "4.40",
      reviewCount: 18,
      badges: [],
      specifications: {
        capacity: "5200mAh",
        chemistry: "LiPo",
        enclosure: "Hardcase",
      },

      images: {
        create: [
          {
            url: "/products/hardcase-lipo-battery-5200mah-01-primary.webp",
            alt: "Generic development image for Hardcase LiPo Battery 5200mAh",
            isPrimary: true,
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: {
      slug: "adjustable-rc-car-stand",
    },

    update: {
      stockQuantity: 15,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
    },

    create: {
      categoryId: accessoriesCategory.id,
      name: "Adjustable RC Car Stand",
      slug: "adjustable-rc-car-stand",
      sku: "HL-3D-STAND-001",
      brand: "HotLap 3D",
      shortDescription:
        "Adjustable 3D printed maintenance and display stand.",
      description:
        "A lightweight adjustable stand for maintaining, storing and displaying compatible RC cars.",
      price: "899.00",
      stockQuantity: 15,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      ratingAverage: "4.70",
      reviewCount: 22,
      badges: ["new"],
      specifications: {
        material: "3D printed polymer",
        use: "Maintenance and display",
        adjustment: "Height adjustable",
      },

      images: {
        create: [
          {
            url: "/products/adjustable-rc-car-stand-01-primary.webp",
            alt: "Generic development image for Adjustable RC Car Stand",
            isPrimary: true,
          },
        ],
      },
    },
  });

  await prisma.coupon.upsert({
    where: {
      code: "HOTLAP10",
    },

    update: {
      isActive: true,
    },

    create: {
      code: "HOTLAP10",
      name: "HotLap 10% Off",
      description:
        "Get 10% off, up to ₹1,500.",
      discountType: "PERCENTAGE",
      discountValue: "10.00",
      minimumSubtotal: "3000.00",
      maximumDiscount: "1500.00",
    },
  });

  await prisma.coupon.upsert({
    where: {
      code: "RC500",
    },

    update: {
      isActive: true,
    },

    create: {
      code: "RC500",
      name: "₹500 RC Discount",
      description:
        "Save ₹500 on orders above ₹5,000.",
      discountType: "FIXED",
      discountValue: "500.00",
      minimumSubtotal: "5000.00",
    },
  });

  console.info(
    "HotLap database seeded successfully.",
  );
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
