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

// Footer navigation data
const footerNavigation = {
  experiencias: [
    { name: "Tours Privados", href: "/home/tours/all" },
    { name: "Alquileres", href: "/home/rental/all" },
    { name: "Propiedades", href: "/home/properties/all" },
  ],
  empresa: [
    { name: "Sé parte", href: "/investment" },
    { name: "Blog", href: "/blog" },
    { name: "Contacto", href: "/contact" },
  ],
  legal: [
    { name: "Términos y Condiciones", href: "/terms" },
    { name: "Política de Privacidad", href: "/privacy" },
  ],
  social: [
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t py-8">
      {/* Main Footer Content */}
      <div className="px-6 md:px-20 mt-8">
        {/* Top Section with Logo and Tagline */}
        <div className="mb-12  text-left">
          <Image src="/logo.svg" alt="Dubuu Logo" width={100} height={40} />
          <p className="text-sm">
            Experiencias de viaje exclusivas diseñadas para los viajeros más
            exigentes.
          </p>

          {/* Social Media */}
          <div className="flex justify-start space-x-6 mb-4 gap-4 pt-4">
            {footerNavigation.social.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-zinc-400 hover transition-colors"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Column 1: Contact */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold tracking-wider uppercase mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+(503) 77886116</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>team@lappsnet.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>El Salvador, La Libertad</span>
              </li>
            </ul>
          </div>

          {/* Columns 3 & 4: Experiencias & Empresa - 2 columns on mobile */}
          <div className="grid grid-cols-2 col-span-1 lg:col-span-1 gap-8">
            {/* Experiencias */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase mb-4">
                Experiencias
              </h3>
              <ul className="space-y-2">
                {footerNavigation.experiencias.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm hover transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider uppercase mb-4">
                Empresa
              </h3>
              <ul className="space-y-2">
                {footerNavigation.empresa.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm hover transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="" />

        {/* Bottom Section */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center text-xs">
          <p className="py-4">
            © {new Date().getFullYear()} dubuu. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 gap-4">
            {footerNavigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
