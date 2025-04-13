import { IProduct, ITourProduct } from "@/types/product";

// Type guard para tours
export function isTourProduct(product: IProduct): product is ITourProduct {
  return product.product_type?.name === "tours";
}

// Type guard para rentals
/* export function isRentalProduct(product: IProduct): product is IRentalProduct {
  return product.product_type?.name === "rental";
} */

// Genérico: puedes usar cualquier string literal si el tipado está bien
export function isProductType<T extends string>(
  product: IProduct,
  type: T
): product is Extract<IProduct, { product_type: { name: T } }> {
  return product.product_type?.name === type;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calculateTotal = ({ watchData, product }: any): number => {
  const ticketTotal = watchData.tickets.adult * product.price;
  const iva = ticketTotal * 0.13;
  const turismo = ticketTotal * 0.05;
  const serviceFee = ticketTotal * 0.03;
  return parseFloat((ticketTotal + iva + turismo + serviceFee).toFixed(2));
};

export type GeneratePDFOptions = {
  filename?: string
  scale?: number
  quality?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Genera un PDF a partir de un elemento HTML
 * @param elementId - ID del elemento HTML a convertir en PDF
 * @param options - Opciones de configuración
 */
export async function generatePDF(elementId: string, options: GeneratePDFOptions = {}): Promise<void> {
  const { filename = "documento.pdf", scale = 2, quality = 0.98, onSuccess, onError } = options

  try {
    // Ocultar los elementos que no deben aparecer en el PDF
    const elementsToHide = document.querySelectorAll(".hide-for-pdf")
    elementsToHide.forEach((el) => el.classList.add("hidden"))

    // Importar las bibliotecas necesarias
    const jsPDFModule = await import("jspdf")
    const html2canvasModule = await import("html2canvas")

    const jsPDF = jsPDFModule.default
    const html2canvas = html2canvasModule.default

    // Obtener el elemento a convertir
    const element = document.getElementById(elementId)

    if (!element) {
      throw new Error(`No se encontró el elemento con ID: ${elementId}`)
    }

    // Crear el canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
    })

    // Crear el PDF
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    })

    // Añadir la imagen del canvas al PDF
    const imgData = canvas.toDataURL("image/jpeg", quality)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0

    pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)

    // Guardar el PDF
    pdf.save(filename)

    // Callback de éxito
    if (onSuccess) onSuccess()
  } catch (error) {
    console.error("Error generating PDF:", error)
    // Callback de error
    if (onError && error instanceof Error) onError(error)
    throw error
  } finally {
    // Mostrar los elementos nuevamente
    const elementsToHide = document.querySelectorAll(".hide-for-pdf")
    elementsToHide.forEach((el) => el.classList.remove("hidden"))
  }
}

/**
 * Hook para manejar la descarga de PDF con estado de carga
 */
export function usePDFDownload() {
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadPDF = async (elementId: string, options: GeneratePDFOptions = {}) => {
    if (isGenerating) return

    setIsGenerating(true)

    try {
      await generatePDF(elementId, {
        ...options,
        onSuccess: () => {
          if (options.onSuccess) options.onSuccess()
        },
        onError: (error) => {
          if (options.onError) options.onError(error)
        },
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return { downloadPDF, isGenerating }
}

// Importación necesaria para el hook
import { useState } from "react"

