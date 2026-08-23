import type { Metadata } from "next";

import PolicyPage from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Review HotLap standard and express shipping charges and the current limits of shipping functionality.",
};

export default function ShippingPage() {
  return (
    <PolicyPage
      eyebrow="Delivery Information"
      title="Shipping Policy"
      introduction="HotLap currently offers two server-priced shipping selections at checkout. Charges are based on the order subtotal after product discounts and are validated again when the order is placed."
      sections={[
        {
          title: "Standard delivery",
          paragraphs: [
            "Standard delivery costs ₹199 when the eligible order subtotal is below ₹5,000. Standard delivery is free when that subtotal is ₹5,000 or more.",
          ],
        },
        {
          title: "Express delivery",
          paragraphs: [
            "Express delivery costs ₹499. The current pricing rule does not apply the free-standard-delivery threshold to express delivery.",
          ],
        },
        {
          title: "What the current storefront supports",
          paragraphs: [
            "Customers can select standard or express delivery during checkout, and the selected method and charge are recorded with the order.",
            "The application does not currently calculate delivery dates, confirm postal-code serviceability, name a carrier, create a shipment, or provide live tracking. Selecting express delivery changes the shipping charge but does not create a published delivery-time promise.",
          ],
        },
        {
          title: "Delivery information",
          paragraphs: [
            "Customers should provide a complete recipient name, Indian mobile number, street address, city, state, and six-digit postal code. Saved addresses can be reviewed before checkout, and the delivery address used for an order is preserved with that order.",
          ],
        },
      ]}
      closing={{
        title: "Review an existing order",
        description:
          "Signed-in customers can view the shipping method and delivery address recorded for an order from order history.",
        href: "/account/orders",
        label: "View Order History",
      }}
    />
  );
}
