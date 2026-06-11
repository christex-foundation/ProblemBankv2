import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { GrainOverlay, PageTransition } from "@/design";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { RaiseModalProvider } from "@/components/feed/RaiseModalProvider";
import { auth } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const signedIn = !!session?.user;

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Outside <PageTransition> so it never re-mounts on navigation and
            never sits inside the transition wrapper's transform (a transformed
            ancestor would capture this fixed overlay and stretch the page). */}
        <GrainOverlay />
        <SessionProviderWrapper>
          <RaiseModalProvider signedIn={signedIn}>
            <PageTransition>{children}</PageTransition>
          </RaiseModalProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
