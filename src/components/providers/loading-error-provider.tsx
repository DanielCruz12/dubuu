"use client";

import React, { ReactNode } from "react";

interface LoadingErrorProviderProps {
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any; // Puedes definir un tipo más específico si lo deseas
  loaderComponent?: ReactNode;
  errorComponent?: ReactNode;
  children: ReactNode;
}

export default function LoadingErrorProvider({
  loading,
  error,
  loaderComponent,
  errorComponent,
  children,
}: LoadingErrorProviderProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        {loaderComponent || <DefaultLoader />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        {errorComponent || <DefaultError />}
      </div>
    );
  }

  return <>{children}</>;
}

function DefaultLoader() {
  return (
    <div className="flex flex-col items-center">
      {/* Spinner básico usando clases de Tailwind CSS */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      <p className="mt-4 text-lg">Cargando...</p>
    </div>
  );
}

function DefaultError() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-red-500">
        Ocurrió un error. Intenta recargar la página.
      </p>
    </div>
  );
}
