/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import TourReceipt from "./receipt";

export function HiddenReceipt({ isOpen, onGenerated }: { isOpen: boolean; onGenerated: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [pdfLibsLoaded, setPdfLibsLoaded] = useState(false)

  // Precargar las bibliotecas de PDF
  useEffect(() => {
    if (isOpen && !pdfLibsLoaded) {
      const loadLibs = async () => {
        try {
          await Promise.all([import("jspdf"), import("html2canvas")])
          setPdfLibsLoaded(true)
        } catch (error) {
          console.error("Error cargando bibliotecas PDF:", error)
        }
      }

      loadLibs()
    }
  }, [isOpen, pdfLibsLoaded])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Solo renderizamos cuando isOpen es true
  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: "-9999px",
        top: 0,
        width: "100%",
        maxWidth: "800px",
        height: "auto",
        overflow: "visible",
        zIndex: -1000,
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <TourReceipt />
    </div>,
    document.body,
  )
}
