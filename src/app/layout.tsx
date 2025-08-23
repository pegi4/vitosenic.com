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
  metadataBase: new URL("https://vitosenic.com"),
  title: {
    template: "%s | Vito Senič",
    default: "Vito Senič | CS Student & AI Automation Builder",
  },
  description: "CS student at UM FERI researching decentralized identity systems and building AI automation solutions. Currently at Blockchain Lab working on SSI/DID/Verifiable Credentials.",
  openGraph: {
    title: "Vito Senič | CS Student & AI Automation Builder",
    description: "CS student at UM FERI researching decentralized identity systems and building AI automation solutions. Currently at Blockchain Lab working on SSI/DID/Verifiable Credentials.",
    url: "https://vitosenic.com",
    siteName: "Vito Senič",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-default.jpg", // Create this image in your public folder
        width: 1200,
        height: 630,
        alt: "Vito Senič - CS Student & AI Automation Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vito Senič | CS Student & AI Automation Builder",
    description: "CS student at UM FERI researching decentralized identity systems and building AI automation solutions. Currently at Blockchain Lab working on SSI/DID/Verifiable Credentials.",
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
