import type { Metadata } from "next";

import PolicyPage from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Basic terms for using the HotLap RC storefront, customer account, catalogue, and ordering experience.",
};

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Store Terms"
      title="Terms of Use"
      introduction="These terms describe the current HotLap storefront experience. Detailed commercial terms that require a formal business decision are deliberately not invented here."
      sections={[
        {
          title: "Using the storefront",
          paragraphs: [
            "HotLap provides a single-company online catalogue for RC cars, parts and accessories, merchandise, 3D-printed accessories, and related products. You should use the storefront lawfully and provide accurate information when creating an account or placing an order.",
            "You are responsible for keeping your sign-in credentials private and for activity performed through your account. Available session controls allow you to sign out of the current session or all sessions.",
          ],
        },
        {
          title: "Products, prices, and availability",
          paragraphs: [
            "Product descriptions, prices, stock, images, specifications, and availability are presented through the current catalogue. Availability may change before checkout.",
            "The server validates active products, stock, coupons, shipping charges, and totals when an order is placed. Adding an item to a wishlist or cart does not reserve stock.",
          ],
        },
        {
          title: "Orders and payment",
          paragraphs: [
            "Customers must sign in before checkout. An order is created after the checkout information passes server validation and the order request succeeds.",
            "Cash on Delivery is the payment method currently presented by the storefront. Online card, UPI, wallet, and net-banking payment processing are not currently offered through the customer checkout.",
          ],
        },
        {
          title: "Shipping, cancellations, returns, and refunds",
          paragraphs: [
            "Shipping charges are described on the Shipping Policy page and are calculated again when an order is placed. Delivery dates, carrier services, and serviceability are not currently promised by the application.",
            "The storefront does not currently provide automated cancellation, return, or refund-request controls. The Returns & Refunds page explains the information that is and is not currently established.",
          ],
        },
        {
          title: "Storefront availability and changes",
          paragraphs: [
            "HotLap may correct catalogue information, change available features, or suspend parts of the storefront for operational or security reasons. This page does not create warranties, jurisdiction rules, arbitration requirements, or other formal terms that HotLap has not established.",
          ],
        },
      ]}
      closing={{
        title: "Review the purchase policies",
        description:
          "Shipping and returns information is available before checkout.",
        href: "/shipping",
        label: "Read Shipping Policy",
      }}
    />
  );
}
