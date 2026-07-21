import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vitosenic.com"),
  title: "Vito Senič",
  description: "CS student & AI automation builder.",
  openGraph: {
    title: "Vito Senič",
    description: "CS student & AI automation builder.",
    url: "https://vitosenic.com",
    siteName: "Vito Senič",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vito Senič",
    description: "CS student & AI automation builder.",
    creator: "@vitosenic",
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
      <body className={spaceGrotesk.variable}>
        {children}
      </body>
    </html>
  );
}
