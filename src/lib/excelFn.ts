/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";

const EXCEL_SHEET_NAME_MAX = 31;

export type ExportToExcelOptions = {
  /** Tab name inside the workbook (Excel max 31 characters). */
  sheetName?: string;
};

export function exportToExcel(
  data: any[],
  fileName: string,
  options?: ExportToExcelOptions,
) {
  const sheetLabel = (options?.sheetName ?? "Datos").slice(
    0,
    EXCEL_SHEET_NAME_MAX,
  );

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetLabel);

  // Generate Excel file as a binary string
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

  // Convert to Blob
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`

  // Append to body, trigger click and remove
  document.body.appendChild(link)
  link.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 0)
}
