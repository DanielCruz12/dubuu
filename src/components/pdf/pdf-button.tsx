/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { ReceiptProps } from "@/types/pdf";

function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export default function PDFButton({
  receiptData,
  buttonText,
  buttonVariant,
  fileName,
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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const generatePDF = async () => {
    if (!isClient) return;

    setIsGenerating(true);

    try {
      // Importamos jsPDF y QRCode solo cuando los necesitamos
      const jsPDF = (await import("jspdf")).default;
      const QRCode = (await import("qrcode")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      // Crear un nuevo documento PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Configurar fuentes
      doc.setFont("helvetica", "normal");

      // Colores
      const primaryColor = [26, 26, 26, 0.47]; // rgba(26, 26, 26, 0.47) en RGB
      const grayColor = [85, 85, 85]; // #555555 en RGB
      const lightGrayColor = [243, 244, 246]; // #F3F4F6 en RGB
      const veryLightGray = [245, 245, 245]; // Color muy claro para simular transparencia

      // Añadir línea decorativa en la parte superior
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(10, 10, 190, 3, "F");

      // Añadir esquina decorativa (usando un color muy claro en lugar de transparencia)
      doc.setFillColor(veryLightGray[0], veryLightGray[1], veryLightGray[2]);
      doc.circle(200, 10, 30, "F");

      // Añadir marca de agua (usando un color muy claro en lugar de transparencia)
      doc.setTextColor(240, 240, 240); // Color muy claro para la marca de agua
      doc.setFontSize(60);
      doc.text("RECIBO", 105, 150, { align: "center" });

      // Cargar el logo como data URL para jsPDF
      let logoDataUrl: string | null = null;
      try {
        logoDataUrl = await loadImageAsDataUrl("/logo.png");
      } catch {
        // sin logo, se usará texto fallback
      }

      // Encabezado - Logo de la empresa
      let companyInfoStartY: number;
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", 10, 12, 42, 16);
        companyInfoStartY = 35;
      } else {
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(receiptData.companyName, 10, 25);
        companyInfoStartY = 30;
      }

      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      let yPos = companyInfoStartY;
      if (receiptData.companyAddress) {
        doc.text(receiptData.companyAddress, 10, yPos);
        yPos += 5;
      }
      if (receiptData.companyPhone) {
        doc.text(`Tel: ${receiptData.companyPhone}`, 10, yPos);
        yPos += 5;
      }
      if (receiptData.companyEmail) {
        doc.text(`Email: ${receiptData.companyEmail}`, 10, yPos);
        yPos += 5;
      }
      if (receiptData.companyWebsite) {
        doc.text(`Web: ${receiptData.companyWebsite}`, 10, yPos);
      }

      // Título del recibo a la derecha
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("RECIBO", 200, 25, { align: "right" });

      // Línea separadora
      doc.setDrawColor(238, 238, 238);
      doc.line(10, 50, 200, 50);

      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("RECIBO #", 10, 55);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(receiptData.receiptNumber, 10, 60);

      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("FECHA DE EMISIÓN", 10, 65);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(receiptData.date, 10, 70);

      if (receiptData.reservationDate) {
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text("FECHA DE RESERVA", 10, 75);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(receiptData.reservationDate, 10, 80);
      }

      // Información de pago (a la derecha)
      if (receiptData.paymentMethod) {
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text("MÉTODO DE PAGO", 200, 55, { align: "right" });
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text(receiptData.paymentMethod, 200, 60, { align: "right" });
      }

      if (receiptData.paymentStatus) {
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text("ESTADO", 200, 65, { align: "right" });

        // Color según el estado
        let statusColor: [number, number, number] = [0, 0, 0];
        switch (receiptData.paymentStatus) {
          case "Completado":
            statusColor = [22, 101, 52]; // #166534 en RGB
            break;
          case "En proceso":
            statusColor = [146, 64, 14]; // #92400E en RGB
            break;
          case "Cancelado":
            statusColor = [185, 28, 28]; // #B91C1C en RGB
            break;
        }

        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.setFontSize(11);
        doc.text(receiptData.paymentStatus, 200, 70, { align: "right" });
      }

      doc.line(10, 85, 200, 85);

      // Información del cliente
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text("CLIENTE", 10, 90);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text(receiptData.customerName, 10, 95);

      yPos = 100;
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      if (receiptData.customerAddress) {
        doc.text(`Dirección: ${receiptData.customerAddress}`, 10, yPos);
        yPos += 5;
      }

      doc.line(10, yPos + 5, 200, yPos + 5);
      yPos += 10;

      // Vehicle info (for rental receipts)
      if (receiptData.vehicle) {
        const v = receiptData.vehicle;
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text("VEHÍCULO", 10, yPos);
        yPos += 6;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);

        const leftFields = [
          ["Marca", v.brand],
          ["Modelo", v.model],
          ["Año", String(v.year)],
          ["Color", v.color],
        ];
        const leftX = 10;
        let rowY = yPos;
        for (const [label, value] of leftFields) {
          doc.setFontSize(9);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.text(`${label}:`, leftX, rowY);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.text(value, leftX + 22, rowY);
          rowY += 6;
        }

        const rightFields = [
          ["Placa", v.plate || "—"],
          ["VIN", v.vin || "—"],
          ["Combustible", v.fuel_type],
          ["Transmisión", v.transmission],
          ["Motor", v.engine],
        ];
        const rightX = 110;
        rowY = yPos;
        for (const [label, value] of rightFields) {
          doc.setFontSize(9);
          doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          doc.text(`${label}:`, rightX, rowY);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.text(value, rightX + 26, rowY);
          rowY += 6;
        }

        yPos = rowY + 5;
        doc.line(10, yPos, 200, yPos);
        yPos += 8;
      }

      // Tabla de productos/servicios
      const tableColumn = ["Descripción", "Cantidad", "Precio", "Total"];
      const tableRows = receiptData.items.map((item) => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.price as number),
        formatCurrency((item.price as number) * item.quantity),
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: "plain",
        headStyles: {
          fillColor: [lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 40, halign: "right" },
          3: { cellWidth: 40, halign: "right" },
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: 10, right: 10 },
      });

      // Obtener la posición Y después de la tabla
      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Resumen (subtotal, impuestos, total)
      const summaryX = 130;
      const summaryWidth = 60;

      // Subtotal
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Subtotal", summaryX, yPos);
      doc.text(
        formatCurrency(receiptData.subtotal as number),
        summaryX + summaryWidth,
        yPos,
        { align: "right" }
      );
      yPos += 6;

      // Total
      doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
      doc.rect(summaryX - 5, yPos - 4, summaryWidth + 15, 10, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total", summaryX, yPos + 2);
      doc.text(
        formatCurrency(receiptData.total),
        summaryX + summaryWidth,
        yPos + 2,
        { align: "right" }
      );
      doc.setFont("helvetica", "normal");

      yPos += 20;

      // Pie de página
      doc.setDrawColor(229, 231, 235);
      doc.line(10, yPos, 200, yPos);
      yPos += 10;

      // Notas
      if (receiptData.notes) {
        doc.setFontSize(10);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text("NOTAS", 10, yPos);
        yPos += 5;
        doc.setFontSize(9);
        doc.text(receiptData.notes, 10, yPos, {
          maxWidth: 120,
        });
      }

      // Calcular la altura del texto de las notas
      const notesHeight = receiptData.notes
        ? Math.ceil(
            doc.getTextDimensions(receiptData.notes, { maxWidth: 120 }).h
          )
        : 0;
      yPos = Math.max(yPos + notesHeight + 5, yPos + 10);

      doc.setFontSize(9);

      // Código QR
      try {
        const qrValue =
          receiptData.qrValue || `RECEIPT:${receiptData.receiptNumber}`;
        const qrDataURL = await QRCode.toDataURL(qrValue, {
          margin: 1,
          width: 100,
        });

        // Añadir el código QR en la esquina inferior derecha
        doc.addImage(qrDataURL, "PNG", 160, yPos - 30, 30, 30);
        doc.setFontSize(8);
      } catch (err) {
        console.error("Error generando código QR:", err);
      }

      // Guardar el PDF
      doc.save(fileName);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Button
      className="w-full"
      variant={buttonVariant}
      onClick={generatePDF}
      disabled={!isClient || isGenerating}
    >
      <FileDown className="mr-2 h-4 w-4" />
      {isGenerating ? "Generando..." : buttonText}
    </Button>
  );
}
