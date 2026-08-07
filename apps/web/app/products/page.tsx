import Container from "@/components/layout/Container";
import Section from "@/components/layout/Section";
import ProductCatalog from "@/components/products/ProductCatalog";
import SectionHeading from "@/components/ui/SectionHeading";

import {
  getCategories,
} from "@/lib/api/categories";

import {
  getAllProducts,
} from "@/lib/products";

import {
  parseProductCatalogueQuery,
} from "@/lib/product-catalog-query";

import {
  mapProductSortToApi,
  PRODUCT_PAGE_SIZE,
} from "@/types/product-catalog";

type ProductsPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

export const dynamic =
  "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams =
    await searchParams;

  const catalogueQuery =
    parseProductCatalogueQuery(
      resolvedSearchParams,
    );

  const [
    productResponse,
    categoryResponse,
  ] = await Promise.all([
    getAllProducts({
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
    }),

    getCategories(),
  ]);

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

  return (
    <main>
      <Section>
        <Container>
          <SectionHeading
            badge="HotLap Store"
            title="Explore All Products"
            subtitle="Browse RC cars, batteries, spare parts, merchandise, and custom 3D printed accessories."
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