import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Container from "@/components/Container";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vitosenic.com"),
  title: {
    template: "%s | Vito Senič",
    default: "Vito Senič | CS Student & Builder",
  },
  description: "CS student with a builder's mindset — diving deep from code to business strategy to create solutions that actually work in the real world.",
  openGraph: {
    title: "Vito Senič | CS Student & Builder",
    description: "CS student with a builder's mindset — diving deep from code to business strategy to create solutions that actually work in the real world.",
    url: "https://vitosenic.com",
    siteName: "Vito Senič",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-default.jpg", // Create this image in your public folder
        width: 1200,
        height: 630,
        alt: "Vito Senič",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vito Senič | CS Student & Builder",
    description: "CS student with a builder's mindset — diving deep from code to business strategy to create solutions that actually work in the real world.",
    creator: "@vitosenic",
    images: ["/images/og-default.jpg"], // Same image as OpenGraph
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://vitosenic.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
