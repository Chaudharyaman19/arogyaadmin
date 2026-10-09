import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StaticDataInterceptor } from "@/components/StaticDataInterceptor";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Admin Portal | Arogya Sangoshthi 2026",
    template: "%s | Arogya Sangoshthi Admin",
  },
  description:
    "Secure admin portal for Arogya Sangoshthi 2026 — manage website content, exhibitors, partners, enquiries, staff and SEO.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>
        <StaticDataInterceptor />
        <LanguageProvider><StoreProvider>{children}</StoreProvider></LanguageProvider>
      </body>
    </html>
  );
}
