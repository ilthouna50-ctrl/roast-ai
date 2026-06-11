import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "edalbab.ai",
  description: "Speak your problems. We make them worse.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen bg-[#080808] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
