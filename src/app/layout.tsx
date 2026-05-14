import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "../components";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Better font loading performance
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://build.christex.foundation',
  ),
  title: {
    default: 'Problem Bank',
    template: '%s · Problem Bank',
  },
  description:
    "A research-backed intelligence platform for Sierra Leone's most important unsolved problems. Read, download, build.",
  icons: {
    icon: '/images/black%20logo%20mark%20size=48@2x.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Problem Bank',
    title: 'Problem Bank',
    description:
      "A research-backed intelligence platform for Sierra Leone's most important unsolved problems.",
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'Problem Bank',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Problem Bank',
    description:
      "A research-backed intelligence platform for Sierra Leone's most important unsolved problems.",
    images: ['/images/hero.png'],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper>
          {children}
          <Footer />
        </SessionProviderWrapper>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
