"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n-context";

const WOMPI_TERMS_URL = "https://wompi.sv/TerminosCondiciones/Usuario";
const CLOUDFLARE_PRIVACY_URL = "https://www.cloudflare.com/es-es/privacy-policy/";
const GOOGLE_PRIVACY_URL = "https://policies.google.com/privacy";
const CLERK_PRIVACY_URL = "https://clerk.com/privacy";

const linkClass = "text-blue-600 hover:underline";

export default function TermsAndConditionsPage() {
  const { t, language } = useLanguage();

  const section5Content = (
    <span>
      {t("terms.s5.beforeLink")}
      <a href={WOMPI_TERMS_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {WOMPI_TERMS_URL}
      </a>
      {t("terms.s5.afterLink")}
    </span>
  );

  const section8Content = (
    <span>
      {t("terms.s8.part1")}
      <a href={CLOUDFLARE_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Cloudflare
      </a>
      {t("terms.s8.part2")}
      <a href={GOOGLE_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Google reCAPTCHA
      </a>
      {t("terms.s8.part3")}
      <a href={CLERK_PRIVACY_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Clerk
      </a>
      {t("terms.s8.part4")}
      <a href={WOMPI_TERMS_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Wompi
      </a>
      {t("terms.s8.part5")}
    </span>
  );

  const terms: { title: string; content: ReactNode }[] = [
    { title: t("terms.s1.title"), content: t("terms.s1.content") },
    { title: t("terms.s2.title"), content: t("terms.s2.content") },
    { title: t("terms.s3.title"), content: t("terms.s3.content") },
    { title: t("terms.s4.title"), content: t("terms.s4.content") },
    { title: t("terms.s5.title"), content: section5Content },
    { title: t("terms.s6.title"), content: t("terms.s6.content") },
    { title: t("terms.s7.title"), content: t("terms.s7.content") },
    { title: t("terms.s8.title"), content: section8Content },
    { title: t("terms.s9.title"), content: t("terms.s9.content") },
    { title: t("terms.s10.title"), content: t("terms.s10.content") },
  ];

  const dateLocale = language === "es" ? "es-ES" : "en-US";

  return (
    <div className="px-5 md:px-20">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">
        {t("terms.title")}
      </h2>
      <div className="prose prose-sm">
        {terms.map((term, index) => (
          <div className="py-1" key={index}>
            <h2 className="text-sm md:text-base font-medium mb-1">
              {term.title}
            </h2>
            <div className="pb-3 text-sm ">{term.content}</div>
          </div>
        ))}
        <div className="py-1">
          <p className="text-sm mt-4">
            {t("terms.lastUpdate")} {new Date().toLocaleDateString(dateLocale)}
          </p>
        </div>
      </div>
    </div>
  );
}
