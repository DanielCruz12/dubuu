"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";

const footerNavigation = {
  experiencias: [
    { key: "privateTrips", href: "/home" },
    { key: "rentals", href: "/home" },
    { key: "properties", href: "/home" },
  ],
  empresa: [
    { key: "joinUs", href: "/investment" },
    { key: "blog", href: "/blog" },
    { key: "contact", href: "/contact" },
  ],
  legal: [
    { key: "terms", href: "/terms" },
    { key: "privacy", href: "/privacy" },
  ],
  social: [
    { key: "instagram", icon: Instagram, href: "https://www.instagram.com/dubuu_sv/" },
    { key: "facebook", icon: Facebook, href: "https://www.facebook.com/share/1FreatcUm9/" },
    { key: "twitter", icon: Twitter, href: "https://x.com/Dubuu_sv?s=20" },
  ],
};

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  // La landing ("/") trae su propio footer (SiteFooter, dentro de page.tsx)
  // con un estilo distinto — evitamos duplicar footers ahí.
  if (pathname === "/") return null;

  return (
    <footer className="border-t py-8">
      <div className="px-6 md:px-20 mt-8">
        <div className="mb-12 text-left">
          <Image
            src="/logo.svg"
            alt="Dubuu Logo"
            width={100}
            height={40}
            priority
          />
          <p className="text-sm">{t("footer.tagline")}</p>

          <div className="flex justify-start space-x-6 mb-4 gap-4 pt-4">
            {footerNavigation.social.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-zinc-400 hover:text-foreground transition-colors"
              >
                <span className="sr-only">{t(`footer.social.${item.key}`)}</span>
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="mb-8">
            <h3 className="text-xs font-semibold tracking-wider uppercase mb-4">
              {t("footer.sections.contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+503 6456-2432</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>support@dubuu.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>El Salvador, La Libertad</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 col-span-1 lg:col-span-1 gap-8">
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase mb-4">
                {t("footer.sections.experiencias")}
              </h3>
              <ul className="space-y-2">
                {footerNavigation.experiencias.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-foreground/70 transition-colors"
                    >
                      {t(`footer.nav.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase mb-4">
                {t("footer.sections.empresa")}
              </h3>
              <ul className="space-y-2">
                {footerNavigation.empresa.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-foreground/70 transition-colors"
                    >
                      {t(`footer.nav.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        <div className="mb-4 flex flex-col md:flex-row justify-between items-center text-xs">
          <p className="py-4">
            © {new Date().getFullYear()} dubuu. {t("footer.copyright")}
          </p>
          <div className="flex space-x-6 gap-4">
            {footerNavigation.legal.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="hover:text-foreground/70 transition-colors"
              >
                {t(`footer.nav.${item.key}`)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
