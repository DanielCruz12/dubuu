import { Skeleton } from "@/components/ui/skeleton";

export function PersonalInfoSkeleton() {
  return (
    <div className="w-full mx-auto pt-4">
      {/* Encabezado */}
      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Campos de formulario en fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Campo de nombre de usuario */}
      <div className="space-y-2 mb-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Texto de ayuda */}
      <Skeleton className="h-4 w-40 mb-6" />

      {/* Botón de guardar */}
      <Skeleton className="h-10 w-36" />
    </div>
  );
}
