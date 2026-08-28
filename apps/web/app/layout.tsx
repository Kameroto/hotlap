import type {
  Metadata,
} from "next";

import {
  Geist_Mono,
  Rubik,
  Tomorrow,
} from "next/font/google";

import {
  Toaster,
} from "sonner";

import "./globals.css";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import StoreHydration from "@/components/providers/StoreHydration";

import {
  getCategories,
} from "@/lib/api/categories";

const rubik =
  Rubik({
    variable:
      "--font-rubik",

    weight: [
      "400",
      "500",
      "600",
    ],

    subsets: [
      "latin",
    ],
  });

const tomorrow =
  Tomorrow({
    variable:
      "--font-tomorrow",

    weight:
      "700",

    style: [
      "normal",
      "italic",
    ],

    subsets: [
      "latin",
    ],
  });

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: [
      "latin",
    ],
  });

export const metadata: Metadata = {
  title: {
    default:
      "HotLap",

    template:
      "%s | HotLap",
  },

  description:
    "Premium RC cars, performance parts, 3D printed accessories, merchandise, and RC events.",

  applicationName:
    "HotLap",

  keywords: [
    "RC cars",
    "remote controlled cars",
    "RC parts",
    "RC accessories",
    "RC racing",
    "HotLap",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  const navigationCategories =
    await getCategories()
      .then((response) =>
        response.categories.filter(
          (category) =>
            category.productCount >
            0,
        ),
      )
      .catch(() => []);

  return (
    <html
      lang="en"
      className="dark"
    >
      <body
        className={`${rubik.variable} ${tomorrow.variable} ${geistMono.variable} min-h-screen`}
      >
        <StoreHydration>
          <div className="flex min-h-screen flex-col">
            <AnnouncementBar />

            <Navbar
              categories={
                navigationCategories
              }
            />

            <div className="flex-1">
              {children}
            </div>

            <Footer />
          </div>

          <Toaster
            richColors
            closeButton
            position="top-right"
            theme="dark"
          />
        </StoreHydration>
      </body>
    </html>
  );
}
