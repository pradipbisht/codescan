import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeScan — Offline QR Attribution",
  description:
    "Track which newspaper, poster, pamphlet, or hoarding actually drives visits. Live scan counts, any destination website, UTM-ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body
        className={`${geistSans.className} flex min-h-full flex-col bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
