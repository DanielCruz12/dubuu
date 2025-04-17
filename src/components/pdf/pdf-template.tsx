"use client";

import React from "react";
import { useState, useEffect } from "react";
import { FileDown, FileDownIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "../ui/button";

// Importación dinámica con SSR desactivado
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

// Importación dinámica del componente ReceiptPDF
const ReceiptPDF = dynamic(
  () => import("./receipt").then((mod) => mod.ReceiptPDF),
  {
    ssr: false,
    loading: () => <p>Cargando...</p>,
  }
);

export type ReceiptItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

export type ReceiptProps = {
  receiptNumber: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  notes?: string;
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  qrValue?: string;
  paymentMethod?: string;
  paymentStatus?: "Paid" | "Pending" | "Cancelled";
  dueDate?: string;
};

export const PDFTemplate = ({
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
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Si no estamos en el cliente, mostramos solo el botón deshabilitado
  if (!isClient) {
    return (
      <Button variant={buttonVariant} disabled>
        <FileDown className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
    );
  }

  // En el cliente, renderizamos el PDFDownloadLink
  return (
    <>
      {isClient && (
        <PDFDownloadLink
          document={<ReceiptPDF receipt={receiptData} />}
          fileName={fileName}
          className="inline-block"
        >
          {({ loading }) => (
            <Button variant={buttonVariant} disabled={loading}>
              <FileDownIcon className="mr-2 h-4 w-4" />
              {loading ? "Generando..." : buttonText}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </>
  );
};
