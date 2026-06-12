import Link from "next/link";
import type { ComponentType } from "react";
import { FaLinkedin } from "react-icons/fa6";
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
  { name: "Discord", href: "https://discord.gg/9h6NQX6q8", Icon: SiDiscord },
  {
    name: "WhatsApp",
    href: "https://chat.whatsapp.com/D2rH0mP8hHV085CWH4rsFC",
    Icon: SiWhatsapp,
  },
  { name: "X", href: "https://x.com/ChristexFndn", Icon: SiX },
  { name: "TikTok", href: "https://www.tiktok.com/@christexfndn", Icon: SiTiktok },
  { name: "YouTube", href: "https://youtube.com/@christexfndn", Icon: SiYoutube },
  {
    name: "Instagram",
    href: "https://www.instagram.com/christexfndn",
    Icon: SiInstagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/christex-foundation/",
    Icon: FaLinkedin,
  },
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
              target="_blank"
              rel="noopener noreferrer"
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
          Terms &amp; Privacy
        </Link>
      </div>
    </footer>
  );
}
