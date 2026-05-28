import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { PageTransition } from "@/design";
import { RaiseModalProvider } from "@/components/feed/RaiseModalProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Problem Bank — Universe of Problems",
  description:
    "Christex Foundation: a universe of community-named problems in Sierra Leone, drawn from a simulated field survey of 250 respondents across 14 communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <RaiseModalProvider>
          <PageTransition>{children}</PageTransition>
        </RaiseModalProvider>
      </body>
    </html>
  );
}
