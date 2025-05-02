import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <section className="flex items-center h-full p-16">
      <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
        <div className="max-w-md text-center">
          <h2 className="mb-8 font-extrabold text-7xl dark:text-gray-400">
            <span className="sr-only">Error</span>404
          </h2>
          <p className="text-xl font-semibold md:text-2xl">
            Lo sentimos, no pudimos encontrar esta página.
          </p>
          <p className="mt-4 mb-8 dark:text-gray-600">
            Pero no te preocupes, puedes encontrar muchas otras cosas en nuestra
            página de inicio.
          </p>
          <Link
            href={"/home"}
            className={buttonVariants({ variant: "secondary" })}
          >
            Volver a la página de inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
