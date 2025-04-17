/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import { ReceiptProps } from "./pdf-template";

// Registrar fuentes
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    fontFamily: "Roboto",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: "contain",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
    color: "#2563EB",
  },
  receiptInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: "1px solid #EEEEEE",
    paddingBottom: 10,
  },
  receiptInfoLeft: {
    flexDirection: "column",
    width: "50%",
  },
  receiptInfoRight: {
    flexDirection: "column",
    width: "50%",
    alignItems: "flex-end",
  },
  label: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    marginBottom: 5,
  },
  customerInfo: {
    marginBottom: 20,
    borderBottom: "1px solid #EEEEEE",
    paddingBottom: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 5,
  },
  customerDetails: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 8,
    fontWeight: 700,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  tableCol1: {
    width: "40%",
  },
  tableCol2: {
    width: "20%",
    textAlign: "center",
  },
  tableCol3: {
    width: "20%",
    textAlign: "right",
  },
  tableCol4: {
    width: "20%",
    textAlign: "right",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  summaryTable: {
    width: "50%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    fontSize: 10,
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: "#F3F4F6",
  },
  footer: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    borderTopStyle: "solid",
    paddingTop: 20,
  },
  footerLeft: {
    width: "60%",
  },
  footerRight: {
    width: "40%",
    alignItems: "flex-end",
  },
  notes: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 10,
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  paymentInfo: {
    fontSize: 9,
    color: "#555555",
    marginTop: 5,
    textAlign: "right",
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 5,
    padding: 5,
    borderRadius: 4,
    textAlign: "center",
  },
  statusPaid: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  statusCancelled: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  },
});

// Componente para el PDF
const ReceiptPDF = ({ receipt }: { receipt: ReceiptProps }) => {
  const [qrCodeImage, setQrCodeImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrValue = receipt.qrValue || `RECEIPT:${receipt.receiptNumber}`;
        const qrDataURL = await QRCode.toDataURL(qrValue, {
          margin: 1,
          width: 200,
        });
        setQrCodeImage(qrDataURL);
      } catch (err) {
        console.error("Error generando código QR:", err);
      }
    };

    generateQRCode();
  }, [receipt]);

  const getStatusStyle = () => {
    switch (receipt.paymentStatus) {
      case "Paid":
        return styles.statusPaid;
      case "Pending":
        return styles.statusPending;
      case "Cancelled":
        return styles.statusCancelled;
      default:
        return {};
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {receipt.companyLogo && (
              <Image
                src={receipt.companyLogo || "/placeholder.svg"}
                style={styles.logo}
              />
            )}
            <Text style={styles.companyName}>{receipt.companyName}</Text>
            {receipt.companyAddress && (
              <Text style={styles.companyInfo}>{receipt.companyAddress}</Text>
            )}
            {receipt.companyPhone && (
              <Text style={styles.companyInfo}>
                Tel: {receipt.companyPhone}
              </Text>
            )}
            {receipt.companyEmail && (
              <Text style={styles.companyInfo}>
                Email: {receipt.companyEmail}
              </Text>
            )}
            {receipt.companyWebsite && (
              <Text style={styles.companyInfo}>
                Web: {receipt.companyWebsite}
              </Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>RECIBO</Text>
          </View>
        </View>

        {/* Información del recibo */}
        <View style={styles.receiptInfo}>
          <View style={styles.receiptInfoLeft}>
            <Text style={styles.label}>RECIBO #</Text>
            <Text style={styles.value}>{receipt.receiptNumber}</Text>
            <Text style={styles.label}>FECHA DE EMISIÓN</Text>
            <Text style={styles.value}>{receipt.date}</Text>
            {receipt.dueDate && (
              <>
                <Text style={styles.label}>FECHA DE VENCIMIENTO</Text>
                <Text style={styles.value}>{receipt.dueDate}</Text>
              </>
            )}
          </View>
          <View style={styles.receiptInfoRight}>
            {receipt.paymentMethod && (
              <>
                <Text style={styles.label}>MÉTODO DE PAGO</Text>
                <Text style={styles.value}>{receipt.paymentMethod}</Text>
              </>
            )}
            {receipt.paymentStatus && (
              <>
                <Text style={styles.label}>ESTADO</Text>
                <Text style={{ ...styles.paymentStatus, ...getStatusStyle() }}>
                  {receipt.paymentStatus}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Información del cliente */}
        <View style={styles.customerInfo}>
          <Text style={styles.label}>CLIENTE</Text>
          <Text style={styles.customerName}>{receipt.customerName}</Text>
          {receipt.customerEmail && (
            <Text style={styles.customerDetails}>
              Email: {receipt.customerEmail}
            </Text>
          )}
          {receipt.customerAddress && (
            <Text style={styles.customerDetails}>
              Dirección: {receipt.customerAddress}
            </Text>
          )}
        </View>

        {/* Tabla de productos/servicios */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Descripción</Text>
            <Text style={styles.tableCol2}>Cantidad</Text>
            <Text style={styles.tableCol3}>Precio</Text>
            <Text style={styles.tableCol4}>Total</Text>
          </View>
          {receipt.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableCol1}>{item.description}</Text>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>{formatCurrency(item.price)}</Text>
              <Text style={styles.tableCol4}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Resumen */}
        <View style={styles.summary}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text>Subtotal</Text>
              <Text>{formatCurrency(receipt.subtotal)}</Text>
            </View>
            {receipt.tax !== undefined && (
              <View style={styles.summaryRow}>
                <Text>IVA ({(receipt.tax * 100).toFixed(0)}%)</Text>
                <Text>{formatCurrency(receipt.subtotal * receipt.tax)}</Text>
              </View>
            )}
            {receipt.discount !== undefined && (
              <View style={styles.summaryRow}>
                <Text>Descuento</Text>
                <Text>-{formatCurrency(receipt.discount)}</Text>
              </View>
            )}
            <View style={styles.summaryTotal}>
              <Text>Total</Text>
              <Text>{formatCurrency(receipt.total)}</Text>
            </View>
          </View>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {receipt.notes && (
              <>
                <Text style={styles.label}>NOTAS</Text>
                <Text style={styles.notes}>{receipt.notes}</Text>
              </>
            )}
            <Text style={styles.notes}>
              Gracias por su confianza. Este recibo sirve como comprobante de
              pago.
            </Text>
          </View>
          <View style={styles.footerRight}>
            {qrCodeImage && (
              <Image
                src={qrCodeImage || "/placeholder.svg"}
                style={styles.qrCode}
              />
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Componente cliente que maneja la descarga del PDF
export default function PDFClientComponent({
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
  return (
    <PDFDownloadLink
      document={<ReceiptPDF receipt={receiptData} />}
      fileName={fileName}
      className="inline-block"
    >
      {({ loading, error }: any) => (
        <Button variant={buttonVariant} disabled={loading}>
          <FileDown className="mr-2 h-4 w-4" />
          {loading ? "Generando..." : buttonText}
          {error && console.error("Error generando PDF:", error)}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
