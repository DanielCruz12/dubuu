import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PaymentSkeleton() {
  return (
    <Card className="w-full">
      {/* Header con título y descripción */}
      <CardHeader className="pb-2">
        <Skeleton className="h-7 w-[180px] mb-2" />
        <Skeleton className="h-4 w-[250px]" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-1 w-8 mx-2" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Opciones de método de pago */}
        <div className="space-y-3">
          <Skeleton className="h-[60px] w-full rounded-md" />
        </div>

        {/* Campos de formulario - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-2 pt-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
