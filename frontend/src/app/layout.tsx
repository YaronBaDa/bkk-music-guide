import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Chango } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const chango = Chango({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chango",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Live / BKK — Bangkok Concerts & Live Music",
  description:
    "Bangkok's complete guide to concerts, live music and festivals. 300+ upcoming shows across IMPACT Arena, livehouses, and clubs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${chango.variable}`}>
      <body className={`${plusJakartaSans.className} min-h-screen bg-background text-text-primary antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-text-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
