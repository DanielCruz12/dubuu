"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Route, Users, ShieldCheck } from "lucide-react";
import type { IProduct } from "@/types/product";
import { useGetProductsByUserIdQuery } from "@/redux/slices/product/product-slice";
import { isProductType } from "@/utils";

function getProductUser(product: IProduct) {
  const u = product?.user;
  if (!u) return null;
  return Array.isArray(u) ? u[0] : u;
}

// Info de prueba hasta que venga del backend (enfocada en tours)
const TEST_OPERATOR = {
  evaluaciones: 318,
  calificacion: "4.88",
  anosExperiencia: 3,
  detalles: [
    { icon: MapPin, label: "Especialidad:", value: "Senderismo y aventura" },
    {
      icon: Route,
      label: "Tipo de experiencias:",
      value: "Rutas exigentes, naturaleza y montaña",
    },
    {
      icon: Users,
      label: "Estilo:",
      value: "Grupos pequeños, atención personalizada",
    },
  ],
  descripcion:
    "Enfocado en seguridad y en que cada viajero viva una experiencia memorable.",
  indiceRespuesta: "100%",
  tiempoRespuesta: "Responde en menos de una hora",
  intro:
    "Operador con experiencia en rutas de montaña y naturaleza.",
  tiposExperiencia: [
    "Senderismo",
    "Aventura",
    "Naturaleza",
    "Montaña",
    "Rutas exigentes",
  ],
  idiomas: ["Español", "Inglés"],
};

function CompanyInfoSkeleton() {
  return (
    <div className="mt-12 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-28" />
              <div className="flex flex-wrap gap-4 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompanyInfoProps {
  product: IProduct | null | undefined;
}

export default function CompanyInfo({ product }: CompanyInfoProps) {
  const user = product ? getProductUser(product) : null;
  const { data: userProducts = [] } = useGetProductsByUserIdQuery(
    user?.id ?? "",
    {
      skip: !user?.id,
    },
  );
  const toursCount = useMemo(
    () => userProducts.filter((p) => isProductType(p, "tours")).length,
    [userProducts],
  );

  if (!product) return null;

  if (!user) {
    return (
      <div className="mt-12">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">
          Quién organiza este tour
        </h2>
        <CompanyInfoSkeleton />
      </div>
    );
  }

  const username = user.username ?? "";
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);
  const photo = "";
  const op = TEST_OPERATOR;

  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-xl md:text-2xl font-semibold">
        Quién organiza este tour
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: card con borde */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
              <Avatar className="h-24 w-24 border-0">
                {photo ? <AvatarImage src={photo} alt={displayName} /> : null}
                <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                  {username.slice(0, 2).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-tl-md bg-green-500 text-primary-foreground">
                <ShieldCheck className="h-3 w-3 text-white" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold">{displayName}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Operador Turistico
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                <span>{op.evaluaciones} evaluaciones</span>
                <span>{toursCount} tours</span>
                <span>{op.anosExperiencia} años de experiencia</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{op.intro}</p>
          </div>

          <ul className="space-y-3">
            {op.detalles.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex gap-3 text-sm">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <span>
                    <span className="font-medium text-muted-foreground">
                      {item.label}{" "}
                    </span>
                    {item.value}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Información del operador</h4>
            <p className="text-sm text-muted-foreground">{op.descripcion}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Tipos de experiencia</h4>
            <div className="flex flex-wrap gap-2">
              {op.tiposExperiencia.map((tipo) => (
                <Badge
                  key={tipo}
                  variant="secondary"
                  className="text-xs font-normal py-1 px-2 rounded-md"
                >
                  {tipo}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Idiomas</h4>
            <div className="flex flex-wrap gap-2">
              {op.idiomas.map((idioma) => (
                <Badge
                  key={idioma}
                  variant="secondary"
                  className="text-xs font-normal py-1 px-2 rounded-md"
                >
                  {idioma}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
