import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTableSkeleton({ headers }: { headers: string[] }) {
  return (
    <div className="w-full rounded-lg border p-4 shadow-sm">
      {/* Cabecera */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Producto</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Skeleton className="h-10 w-full md:w-[300px]" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="w-[250px]">
                  {header} <span className="ml-1 text-gray-400">↕</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Filas de skeleton */}
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500"></span>
          <Skeleton className="h-10 w-16" />
        </div>
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
