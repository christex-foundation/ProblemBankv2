import Link from "next/link";
import type { ComponentType } from "react";
import {
  SiDiscord,
  SiInstagram,
  SiTiktok,
  SiX,
  SiWhatsapp,
  SiYoutube,
} from "react-icons/si";

type SocialItem = {
  name: string;
  href: string;
  Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

const SOCIAL_LINKS: SocialItem[] = [
  { name: "Discord", href: "#", Icon: SiDiscord },
  { name: "WhatsApp", href: "#", Icon: SiWhatsapp },
  { name: "X", href: "#", Icon: SiX },
  { name: "TikTok", href: "#", Icon: SiTiktok },
  { name: "YouTube", href: "#", Icon: SiYoutube },
  { name: "Instagram", href: "#", Icon: SiInstagram },
];

export function Footer() {
  return (
    <footer className="relative bg-foreground text-background px-6 md:px-10 py-6">
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-y-3 gap-x-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-background/55 num order-1">
          © 2026 Problem Bank. All rights reserved.
        </p>

        <nav
          aria-label="Social"
          className="flex items-center gap-1 -mx-2.5 order-3 sm:order-2"
        >
          {SOCIAL_LINKS.map(({ name, href, Icon }) => (
            <a
              key={name}
              href={href}
              aria-label={name}
              className="inline-flex items-center justify-center p-2.5 text-background/55 hover:text-background transition-soft"
            >
              <Icon size={18} aria-hidden />
            </a>
          ))}
        </nav>

        <Link
          href="/terms"
          className="text-[11px] uppercase tracking-[0.22em] font-semibold text-accent hover:text-background transition-soft order-2 sm:order-3 link-underline"
        >
          Terms &amp; Conditions
        </Link>
      </div>
    </footer>
  );
}
