/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { ReceiptProps } from "./pdf-template";

// Este componente es un wrapper que solo se renderiza en el cliente
export default function PDFDownloadButton({
  receiptData,
  buttonText = "Descargar Recibo",
  buttonVariant = "default",
  fileName = "recibo.pdf",
}: {
  receiptData: ReceiptProps;
  buttonText?: string;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  fileName?: string;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Importamos dinámicamente el componente real solo cuando estamos en el cliente
  const [PDFComponent, setPDFComponent] =
    useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Solo importamos el componente real cuando estamos en el cliente
      import("./pdf-client-component").then((module) => {
        setPDFComponent(() => module.default);
      });
    }
  }, []);

  // Si no estamos en el cliente o el componente no se ha cargado, mostramos un botón de carga
  if (!isClient || !PDFComponent) {
    return (
      <Button variant={buttonVariant} disabled>
        <FileDown className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    );
  }

  // Cuando estamos en el cliente y el componente se ha cargado, lo renderizamos
  const ClientPDFComponent = PDFComponent;
  return (
    <ClientPDFComponent
      receiptData={receiptData}
      buttonText={buttonText}
      buttonVariant={buttonVariant}
      fileName={fileName}
    />
  );
}
