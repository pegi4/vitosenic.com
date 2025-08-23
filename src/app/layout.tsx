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
  description: "I’m a Computer Science student at UM FERI, currently combining my studies with hands-on work in research and development.",
  openGraph: {
    title: "Vito Senič | CS Student & AI Automation Builder",
    description: "I’m a Computer Science student at UM FERI, currently combining my studies with hands-on work in research and development.",
    url: "https://vitosenic.com",
    siteName: "Vito Senič",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Vito Senič | CS Student & AI Automation Builder",
    description: "I’m a Computer Science student at UM FERI, currently combining my studies with hands-on work in research and development.",
    creator: "@vitosenic",
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
