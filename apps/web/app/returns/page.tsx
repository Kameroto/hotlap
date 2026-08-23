import type { Metadata } from "next";

import PolicyPage from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Current information about HotLap order cancellations, returns, and refunds.",
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      eyebrow="Customer Care"
      title="Returns & Refunds"
      introduction="HotLap has not yet published formal cancellation, return-eligibility, or refund-processing rules. This page states the current storefront capabilities without inventing policy terms."
      sections={[
        {
          title: "Before placing an order",
          paragraphs: [
            "Review product information, compatibility details, quantities, delivery address, shipping selection, coupon, and order total before confirming checkout. Adding a product to a cart or wishlist does not reserve stock.",
          ],
        },
        {
          title: "Order cancellation",
          paragraphs: [
            "The current customer account does not include an automated order-cancellation control, and the API does not expose a customer cancellation workflow.",
            "A verified support channel and the conditions under which HotLap can accept a cancellation still need to be formally established. This page therefore does not promise that an order can be cancelled after it is placed.",
          ],
        },
        {
          title: "Returns",
          paragraphs: [
            "The storefront does not currently submit or track return requests. HotLap has not yet defined a public return window, product-condition rules, exclusions, return-shipping responsibility, or restocking fees.",
            "Those terms must be published before a customer-facing returns process is offered. No action on this page creates a return request.",
          ],
        },
        {
          title: "Refunds",
          paragraphs: [
            "Cash on Delivery is the payment method currently presented at checkout. The application can represent refund-related order and payment statuses, but it does not currently initiate, process, or track a customer refund.",
            "Refund eligibility, method, approval process, and processing timelines have not yet been established. No refund timeline or outcome is promised by this page.",
          ],
        },
        {
          title: "Keep your order information",
          paragraphs: [
            "Your authenticated order history contains the order reference, items, status, delivery address, shipping method, payment status, and totals. Keep the order reference available for any future support process.",
          ],
        },
      ]}
      closing={{
        title: "Find your order details",
        description:
          "Open order history to review the information recorded for an existing purchase.",
        href: "/account/orders",
        label: "View Order History",
      }}
    />
  );
}
