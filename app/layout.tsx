import type { Metadata } from "next";
import { Smooch_Sans } from "next/font/google";
import "./globals.css";

const smooch_sans = Smooch_Sans({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: "BEAM & FRAME ANALYSIS",
  description:
    "Easily calculate slope deflection for structural analysis with precision and ease. Get accurate results in just a few clicks!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={smooch_sans.className}>{children}</body>
    </html>
  );
}
