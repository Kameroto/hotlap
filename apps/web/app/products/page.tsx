import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductCatalog from "@/components/products/ProductCatalog";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  getCategories,
} from "@/lib/api/categories";

import {
  buildProductCatalogueUrl,
  parseProductCatalogueQuery,
  productCatalogueQueryIsCanonical,
  type ProductSearchParams,
} from "@/lib/product-catalog-query";

import {
  getAllProducts,
} from "@/lib/products";

import {
  mapProductSortToApi,
  PRODUCT_PAGE_SIZE,
} from "@/types/product-catalog";

type ProductsPageProps = {
  searchParams:
    Promise<ProductSearchParams>;
};

export const dynamic =
  "force-dynamic";

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const resolvedSearchParams =
    await searchParams;

  const query =
    parseProductCatalogueQuery(
      resolvedSearchParams,
    );

  const categoryResponse =
    await getCategories();

  const selectedCategory =
    query.category
      ? categoryResponse.categories.find(
          (category) =>
            category.slug ===
            query.category,
        )
      : undefined;

  let title =
    "RC Cars, Parts & Accessories";

  let description =
    "Shop premium RC cars, performance parts, batteries, merchandise, and 3D printed RC accessories from HotLap.";

  if (selectedCategory) {
    title =
      selectedCategory.name;

    description =
      selectedCategory.description ??
      `Shop ${selectedCategory.name} from HotLap. Explore premium RC products and accessories available in India.`;
  }

  if (query.search) {
    title =
      `Search: ${query.search}`;

    description =
      `Search HotLap for ${query.search}. Browse matching RC cars, parts, accessories, batteries, and merchandise.`;
  }

  const canonicalPath =
    buildProductCatalogueUrl(
      query,
    );

  return {
    title,
    description,

    alternates: {
      canonical:
        canonicalPath,
    },

    robots:
      query.search ||
      (
        query.page &&
        query.page > 1
      )
        ? {
            index: false,
            follow: true,
          }
        : {
            index: true,
            follow: true,
          },
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const catalogueQuery =
    parseProductCatalogueQuery(
      resolvedSearchParams,
    );

  if (
    !productCatalogueQueryIsCanonical(
      resolvedSearchParams,
      catalogueQuery,
    )
  ) {
    redirect(
      buildProductCatalogueUrl(
        catalogueQuery,
      ),
    );
  }

  const categoryResponse =
    await getCategories();

  const selectedCategory =
    catalogueQuery.category
      ? categoryResponse.categories.find(
          (category) =>
            category.slug ===
            catalogueQuery.category,
        )
      : undefined;

  if (
    catalogueQuery.category &&
    !selectedCategory
  ) {
    const cleanUrl =
      buildProductCatalogueUrl({
        ...catalogueQuery,
        category: undefined,
        page: 1,
      });

    redirect(
      cleanUrl,
    );
  }

  const productResponse =
    await getAllProducts({
      search:
        catalogueQuery.search,

      category:
        catalogueQuery.category,

      sort:
        mapProductSortToApi(
          catalogueQuery.sort ??
            "featured",
        ),

      page:
        catalogueQuery.page ??
        1,

      pageSize:
        PRODUCT_PAGE_SIZE,
    });

  /*
   * A page number can become invalid after
   * filters change or products are removed.
   */
  if (
    (
      catalogueQuery.page ??
      1
    ) >
      Math.max(
        productResponse.pagination
          .totalPages,
        1,
      )
  ) {
    redirect(
      buildProductCatalogueUrl({
        ...catalogueQuery,

        page:
          Math.max(
            productResponse.pagination
              .totalPages,
            1,
          ),
      }),
    );
  }

  const categories =
    categoryResponse.categories
      .filter(
        (category) =>
          category.productCount >
          0,
      )
      .map(
        (category) => ({
          value:
            category.slug,

          label:
            `${category.name} (${category.productCount})`,
        }),
      );

  const catalogueTitle =
    selectedCategory
      ? selectedCategory.name
      : catalogueQuery.search
        ? `Search results for “${catalogueQuery.search}”`
        : "Explore All Products";

  const catalogueSubtitle =
    selectedCategory
      ? selectedCategory.description ??
        `Browse HotLap ${selectedCategory.name}.`
      : catalogueQuery.search
        ? "Browse products matching your search across the HotLap catalogue."
        : "Browse RC cars, batteries, spare parts, merchandise, and custom 3D printed accessories.";

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            badge="HotLap Store"
            title={
              catalogueTitle
            }
            subtitle={
              catalogueSubtitle
            }
          />

          <ProductCatalog
            products={
              productResponse.products
            }
            pagination={
              productResponse.pagination
            }
            query={
              catalogueQuery
            }
            categories={
              categories
            }
          />
        </Container>
      </Section>
    </main>
  );
}
