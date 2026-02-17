"use client";

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <section className="flex items-center h-full p-16">
      <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
        <div className="max-w-md text-center">
          <h2 className="mb-8 font-extrabold text-7xl dark:text-gray-400">
            <span className="sr-only">Error</span>404
          </h2>
          <p className="text-xl font-semibold md:text-2xl">
            {t("common.notFound.message")}
          </p>
          <p className="mt-4 mb-8 dark:text-gray-600">
            {t("common.notFound.submessage")}
          </p>
          <Link
            href={"/home"}
            className={buttonVariants({ variant: "secondary" })}
          >
            {t("common.notFound.back")}
          </Link>
        </div>
      </div>
    </section>
  );
}
