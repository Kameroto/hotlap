import type { Metadata } from "next";

import PolicyPage from "@/components/shared/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the HotLap storefront uses account, address, cart, wishlist, order, session, and operational information.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="Privacy Policy"
      introduction="This page describes the information the current HotLap storefront uses to provide customer accounts and the online purchasing experience. It avoids making commitments about providers or retention periods that have not yet been established."
      sections={[
        {
          title: "Information used by HotLap",
          paragraphs: [
            "The storefront uses information you provide when creating and maintaining an account, saving delivery details, or placing an order.",
          ],
          bullets: [
            "Account details such as your name, email address, optional phone number, and protected password information.",
            "Saved delivery addresses and the delivery information attached to an order.",
            "Wishlist, cart, coupon, shipping selection, and order information.",
            "Authentication-session information and operational data such as session expiry, browser user agent, IP address, request records, and security logs.",
          ],
        },
        {
          title: "How information is used",
          paragraphs: [
            "HotLap uses this information to create and secure customer accounts, preserve carts and wishlists, validate stock and discounts, place orders, show order history, manage delivery addresses, and operate and protect the service.",
            "Order records retain a snapshot of product and delivery information so that customers can review what was ordered even when catalogue or saved-address details later change.",
          ],
        },
        {
          title: "Sessions and local browser storage",
          paragraphs: [
            "The application uses an HTTP-only refresh-session cookie to maintain sign-in sessions. A short-lived access token is held in browser memory while the application is open.",
            "For customers who are not signed in, a guest-cart identifier may be stored in browser storage. Recently viewed products may also be stored locally in the browser. Signed-in wishlist, cart, address, and order information is stored by the HotLap service.",
          ],
        },
        {
          title: "Choices and account information",
          paragraphs: [
            "Signed-in customers can update supported profile fields, manage saved addresses, remove wishlist items, change cart contents, and sign out of one or all active sessions through the available account controls.",
            "A verified direct privacy-contact channel and detailed retention schedule have not yet been published. Those details should be established before production launch.",
          ],
        },
        {
          title: "Changes to this information",
          paragraphs: [
            "This page should be updated when HotLap adds new operational providers, communications, analytics, payment methods, or other uses of customer information. Customers should review the current version when using the storefront.",
          ],
        },
      ]}
      closing={{
        title: "Need store information?",
        description:
          "The Contact & Support page explains the currently available account, order, and policy resources.",
        href: "/contact",
        label: "Visit Contact & Support",
      }}
    />
  );
}
