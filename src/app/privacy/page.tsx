"use client";

// PENDIENTE DE REVISIÓN LEGAL: el contenido de esta página es una plantilla base.
// Debe ser revisado y validado por un abogado salvadoreño antes de publicarse en producción.
// Placeholders pendientes de completar con datos reales de la empresa: [RAZÓN SOCIAL]/[LEGAL COMPANY NAME],
// [NIT], [DOMICILIO FISCAL]/[REGISTERED ADDRESS], [CORREO DE PRIVACIDAD]/[PRIVACY EMAIL],
// [PLAZO DE RETENCIÓN A DEFINIR]/[RETENTION PERIOD TO BE DEFINED].

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n-context";
import esPrivacy from "../../../public/locales/es/privacy.json";
import enPrivacy from "../../../public/locales/en/privacy.json";

const WOMPI_TERMS_URL = "https://wompi.sv/TerminosCondiciones/Usuario";
const CLERK_PRIVACY_URL = "https://clerk.com/privacy";
const CLOUDFLARE_PRIVACY_URL = "https://www.cloudflare.com/es-es/privacy-policy/";
const GOOGLE_PRIVACY_URL = "https://policies.google.com/privacy";

const linkClass = "text-blue-600 hover:underline";

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  // Contenido importado estáticamente (no depende de un fetch async), así el texto
  // siempre está presente desde el primer render, incluso antes de hidratar.
  const data = language === "en" ? enPrivacy : esPrivacy;

  const section6Content = (
    <span>
      {data.s6.beforeLink}
      <a href={WOMPI_TERMS_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {WOMPI_TERMS_URL}
      </a>
      {data.s6.afterLink}
    </span>
  );

  const section7Content = (
    <span>
      {data.s7.part1}
      <a href={CLERK_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Clerk
      </a>
      {data.s7.part2}
      <a href={CLOUDFLARE_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Cloudflare
      </a>
      {data.s7.part3}
      <a href={GOOGLE_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Google reCAPTCHA
      </a>
      {data.s7.part4}
      <a href={WOMPI_TERMS_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Wompi
      </a>
      {data.s7.part5}
    </span>
  );

  const policies: { title: string; content: ReactNode }[] = [
    { title: data.s1.title, content: data.s1.content },
    { title: data.s2.title, content: data.s2.content },
    { title: data.s3.title, content: data.s3.content },
    { title: data.s4.title, content: data.s4.content },
    { title: data.s5.title, content: data.s5.content },
    { title: data.s6.title, content: section6Content },
    { title: data.s7.title, content: section7Content },
    { title: data.s8.title, content: data.s8.content },
    { title: data.s9.title, content: data.s9.content },
    { title: data.s10.title, content: data.s10.content },
    { title: data.s11.title, content: data.s11.content },
    { title: data.s12.title, content: data.s12.content },
    { title: data.s13.title, content: data.s13.content },
    { title: data.s14.title, content: data.s14.content },
  ];

  const dateLocale = language === "en" ? "en-US" : "es-SV";
  const lastUpdatedLabel = new Date(`${data.lastUpdatedDate}T00:00:00`).toLocaleDateString(
    dateLocale,
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="px-5 md:px-20">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">{data.title}</h2>
      <div className="prose prose-sm">
        <p className="text-sm pb-3">{data.intro}</p>
        {policies.map((policy, index) => (
          <div className="py-1" key={index}>
            <h2 className="text-sm md:text-base font-medium mb-1">
              {policy.title}
            </h2>
            <div className="pb-3 text-sm ">{policy.content}</div>
          </div>
        ))}
        <div className="py-1">
          <p className="text-sm mt-4">
            {data.lastUpdate} {lastUpdatedLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
