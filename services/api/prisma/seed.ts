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
      shortDescription:
        "Development catalogue listing for the MJX Hyper Go 14301 RC vehicle.",
      description:
        "Development catalogue listing for the MJX Hyper Go 14301. Exact model specifications, drivetrain, scale and performance information must be verified before production publication.",
      compareAtPrice: null,
      stockQuantity: 10,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {},
    },

    create: {
      categoryId: rcCarsCategory.id,
      name: "MJX Hyper Go 14301",
      slug: "mjx-hyper-go-14301",
      sku: "HL-MJX-14301",
      brand: "MJX",
      shortDescription:
        "Development catalogue listing for the MJX Hyper Go 14301 RC vehicle.",
      description:
        "Development catalogue listing for the MJX Hyper Go 14301. Exact model specifications, drivetrain, scale and performance information must be verified before production publication.",
      price: "12999.00",
      stockQuantity: 10,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {},

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
      shortDescription:
        "Development catalogue listing for the WLtoys 124019 RC vehicle.",
      description:
        "Development catalogue listing for the WLtoys 124019. Exact scale, chassis, drivetrain and intended-use specifications must be verified before production publication.",
      compareAtPrice: null,
      stockQuantity: 10,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {},
    },

    create: {
      categoryId: rcCarsCategory.id,
      name: "WLtoys 124019",
      slug: "wltoys-124019",
      sku: "HL-WLT-124019",
      brand: "WLtoys",
      shortDescription:
        "Development catalogue listing for the WLtoys 124019 RC vehicle.",
      description:
        "Development catalogue listing for the WLtoys 124019. Exact scale, chassis, drivetrain and intended-use specifications must be verified before production publication.",
      price: "9999.00",
      stockQuantity: 10,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {},

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
      shortDescription:
        "Development catalogue listing for a hardcase RC battery.",
      description:
        "Development catalogue listing for an RC battery. Electrical specifications, connector type, dimensions, charging requirements and vehicle compatibility must be verified before production publication.",
      compareAtPrice: null,
      stockQuantity: 10,
      status: ProductStatus.ACTIVE,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {},
    },

    create: {
      categoryId: batteriesCategory.id,
      name: "Hardcase LiPo Battery 5200mAh",
      slug: "hardcase-lipo-battery-5200mah",
      sku: "HL-BAT-5200",
      brand: "HotLap Power",
      shortDescription:
        "Development catalogue listing for a hardcase RC battery.",
      description:
        "Development catalogue listing for an RC battery. Electrical specifications, connector type, dimensions, charging requirements and vehicle compatibility must be verified before production publication.",
      price: "3499.00",
      stockQuantity: 10,
      status: ProductStatus.ACTIVE,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {},

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
      shortDescription:
        "Adjustable stand for RC car maintenance, storage and display.",
      description:
        "Development catalogue listing for an adjustable RC car stand intended for maintenance, storage and display. Exact material, dimensions and vehicle compatibility must be verified before production publication.",
      compareAtPrice: null,
      stockQuantity: 10,
      isFeatured: true,
      status: ProductStatus.ACTIVE,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {
        use: "Maintenance and display",
      },
    },

    create: {
      categoryId: accessoriesCategory.id,
      name: "Adjustable RC Car Stand",
      slug: "adjustable-rc-car-stand",
      sku: "HL-3D-STAND-001",
      brand: "HotLap 3D",
      shortDescription:
        "Adjustable stand for RC car maintenance, storage and display.",
      description:
        "Development catalogue listing for an adjustable RC car stand intended for maintenance, storage and display. Exact material, dimensions and vehicle compatibility must be verified before production publication.",
      price: "899.00",
      stockQuantity: 10,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      ratingAverage: "0",
      reviewCount: 0,
      badges: [],
      specifications: {
        use: "Maintenance and display",
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
