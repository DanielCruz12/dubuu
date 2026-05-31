/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IContract } from "@/types/contract";

type Lang = "es" | "en";

const FIELD_LABELS: Record<string, Record<Lang, string>> = {
  good_condition_tires: { es: "Llantas en buen estado", en: "Tires in good condition" },
  spare_tire: { es: "Llanta de repuesto", en: "Spare tire" },
  car_jack: { es: "Gato hidráulico", en: "Car jack" },
  safety_cone: { es: "Cono de seguridad", en: "Safety cone" },
  fire_extinguisher: { es: "Extintor", en: "Fire extinguisher" },
  mirrors_and_rearview: { es: "Espejos y retrovisores", en: "Mirrors & rearview" },
  seat_stains: { es: "Manchas en asientos", en: "Seat stains" },
  headlights_and_stops: { es: "Luces delanteras y stops", en: "Headlights & stops" },
  carplay_screen_and_speakers: { es: "Pantalla CarPlay y bocinas", en: "CarPlay screen & speakers" },
  good_condition_windows: { es: "Ventanas en buen estado", en: "Windows in good condition" },
  diesel_caps: { es: "Tapones de diésel", en: "Diesel caps" },
  dashboard_lights: { es: "Luces del tablero", en: "Dashboard lights" },
  air_conditioning: { es: "Aire acondicionado", en: "Air conditioning" },
  safety_hubs: { es: "Seguros de ejes (hubs)", en: "Safety hubs" },
  original_registration_card: { es: "Tarjeta de registro original", en: "Original registration card" },
  mud_flaps: { es: "Guardabarros", en: "Mud flaps" },
  roof_racks_and_ladder: { es: "Racks de techo y escalera", en: "Roof racks & ladder" },
};

function t(lang: Lang) {
  const labels: Record<string, Record<Lang, string>> = {
    title: { es: "CONTRATO DE RENTA", en: "RENTAL CONTRACT" },
    watermark: { es: "CONTRATO", en: "CONTRACT" },
    subtitle: { es: "Dubuu — Contrato Digital", en: "Dubuu — Digital Contract" },
    contractId: { es: "Contrato", en: "Contract" },
    bookingId: { es: "Reserva", en: "Booking" },
    status: { es: "Estado", en: "Status" },
    date: { es: "Fecha", en: "Date" },
    customer: { es: "Cliente", en: "Customer" },
    total: { es: "Total", en: "Total" },
    paymentMethod: { es: "Método de Pago", en: "Payment Method" },
    vehicle: { es: "Vehículo", en: "Vehicle" },
    brand: { es: "Marca", en: "Brand" },
    model: { es: "Modelo", en: "Model" },
    year: { es: "Año", en: "Year" },
    color: { es: "Color", en: "Color" },
    plate: { es: "Placa", en: "Plate" },
    vin: { es: "VIN", en: "VIN" },
    fuel: { es: "Combustible", en: "Fuel" },
    transmission: { es: "Transmisión", en: "Transmission" },
    engine: { es: "Motor", en: "Engine" },
    rentalDetails: { es: "Detalles de la Renta", en: "Rental Details" },
    pickup: { es: "Recogida", en: "Pickup" },
    dropoff: { es: "Devolución", en: "Dropoff" },
    pickupLoc: { es: "Lugar de recogida", en: "Pickup location" },
    dropoffLoc: { es: "Lugar de devolución", en: "Dropoff location" },
    outChecklist: { es: "Detalles de Salida", en: "Check-Out Details" },
    inChecklist: { es: "Detalles de Devolución", en: "Check-In Details" },
    fuelLevel: { es: "Nivel de combustible", en: "Fuel level" },
    item: { es: "Item", en: "Item" },
    obs: { es: "Obs.", en: "Obs." },
    inspector: { es: "Firma Encargado", en: "Inspector Signature" },
    driver: { es: "Firma Cliente", en: "Driver Signature" },
    yes: { es: "SI", en: "YES" },
    no: { es: "NO", en: "NO" },
    page: { es: "Página", en: "Page" },
    vehicleDetails: { es: "Datos del Vehículo", en: "Vehicle Details" },
    contractDetails: { es: "Datos del Contrato", en: "Contract Details" },
    paymentStatus: { es: "Estado del Pago", en: "Payment Status" },
  };
  return (key: string) => labels[key]?.[lang] || labels[key]?.es || key;
}

const STATUS_LABELS: Record<Lang, Record<string, string>> = {
  es: {
    pending_delivery: "Pendiente de Entrega",
    active: "Activo",
    completed: "Completado",
    disputed: "En Disputa",
  },
  en: {
    pending_delivery: "Pending Delivery",
    active: "Active",
    completed: "Completed",
    disputed: "Disputed",
  },
};

function formatDate(d: string | null | undefined, lang: Lang) {
  if (!d) return "—";
  const locale = lang === "es" ? "es-HN" : "en-US";
  return new Date(d).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function drawPage1(
  doc: any,
  contract: IContract,
  lang: Lang,
  logoDataUrl: string | null,
) {
  const _ = t(lang);
  const grayColor = [85, 85, 85];
  const veryLightGray = [245, 245, 245];
  const blueColor = [37, 99, 235];

  // Decorative top bar
  doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.rect(10, 10, 190, 3, "F");

  // Corner circle
  doc.setFillColor(veryLightGray[0], veryLightGray[1], veryLightGray[2]);
  doc.circle(200, 10, 30, "F");

  // Watermark
  doc.setTextColor(245, 245, 245);
  doc.setFontSize(50);
  doc.text(_("watermark"), 105, 150, { align: "center" });

  // Logo
  let companyInfoStartY: number;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 10, 12, 42, 16);
    companyInfoStartY = 35;
  } else {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Dubuu", 10, 25);
    companyInfoStartY = 30;
  }

  doc.setFontSize(9);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  let yPos = companyInfoStartY;
  doc.text("El Salvador, La Libertad", 10, yPos);
  yPos += 5;
  doc.text("Tel: +503 64562432", 10, yPos);
  yPos += 5;
  doc.text("Email: support@dubuu.com", 10, yPos);
  yPos += 5;
  doc.text("Web: https://www.dubuu.com", 10, yPos);

  // Title right-aligned
  doc.setFontSize(22);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text(_("title"), 200, 25, { align: "right" });

  // Separator
  doc.setDrawColor(238, 238, 238);
  doc.line(10, 50, 200, 50);

  // Contract details — left column
  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`${_("contractId").toUpperCase()} #`, 10, 55);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`#${contract.id.slice(0, 8)}`, 10, 60);

  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`${_("bookingId").toUpperCase()} #`, 10, 65);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(`#${contract.booking_id?.slice(0, 8) || "—"}`, 10, 70);

  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(_("date").toUpperCase(), 10, 75);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text(formatDate(contract.created_at, lang), 10, 80);

  // Payment info — right column
  if (contract.booking?.paymentMethod || contract.booking?.total) {
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(_("paymentMethod").toUpperCase(), 200, 55, { align: "right" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const pm = contract.booking?.paymentMethod;
    const pmLabel =
      pm === "blink"
        ? "Bitcoin Lightning (Blink)"
        : pm === "credit"
          ? lang === "es"
            ? "Tarjeta de Crédito"
            : "Credit Card"
          : pm || "—";
    doc.text(pmLabel, 200, 60, { align: "right" });

    if (contract.booking?.total) {
      doc.setFontSize(10);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(_("total").toUpperCase(), 200, 65, { align: "right" });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`$${contract.booking.total}`, 200, 70, { align: "right" });
    }
  }

  // Status badge on right
  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(_("status").toUpperCase(), 200, 80, { align: "right" });
  const statusLabel =
    STATUS_LABELS[lang]?.[contract.status] ||
    STATUS_LABELS.es[contract.status] ||
    contract.status;
  let statusColor: [number, number, number] = [22, 101, 52];
  if (contract.status === "disputed") statusColor = [185, 28, 28];
  else if (contract.status === "pending_delivery") statusColor = [146, 64, 14];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(11);
  doc.text(statusLabel, 200, 85, { align: "right" });

  // Separator
  doc.setDrawColor(238, 238, 238);
  doc.line(10, 90, 200, 90);

  // Customer section
  yPos = 95;
  doc.setFontSize(10);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(_("customer").toUpperCase(), 10, yPos);
  yPos += 5;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  const customerName = contract.customer
    ? `${contract.customer.first_name} ${contract.customer.last_name}`
    : "—";
  doc.text(customerName, 10, yPos);

  yPos += 8;

  // Vehicle section
  const v = contract.vehicle;
  if (v) {
    doc.setDrawColor(238, 238, 238);
    doc.line(10, yPos, 200, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(_("vehicleDetails").toUpperCase(), 10, yPos);
    yPos += 7;

    // Vehicle info in two columns
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const leftX = 10;
    const rightX = 110;
    let rowY = yPos;

    // Left column
    const leftFields = [
      [_("brand"), v.brand],
      [_("model"), v.model],
      [_("year"), String(v.year)],
      [_("color"), v.color],
    ];
    for (const [label, value] of leftFields) {
      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`${label}:`, leftX, rowY);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(value, leftX + 22, rowY);
      rowY += 6;
    }

    // Right column
    rowY = yPos;
    const rightFields = [
      [_("plate"), v.plate || "—"],
      [_("vin"), v.vin || "—"],
      [_("fuel"), v.fuel_type],
      [_("transmission"), v.transmission],
      [_("engine"), v.engine],
    ];
    for (const [label, value] of rightFields) {
      doc.setFontSize(9);
      doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      doc.text(`${label}:`, rightX, rowY);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(value, rightX + 22, rowY);
      rowY += 6;
    }

    yPos = Math.max(rowY, yPos + 6 * 4) + 3;
  }

  // Rental details
  const rental = contract.booking?.rental;
  if (rental) {
    doc.setDrawColor(238, 238, 238);
    doc.line(10, yPos, 200, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(_("rentalDetails").toUpperCase(), 10, yPos);
    yPos += 7;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`${_("pickup")}:`, 10, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(formatDate(rental.pickup_time, lang), 32, yPos);
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`  ${_("pickupLoc")}:`, 80, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(rental.pickup_location || "—", 110, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`${_("dropoff")}:`, 10, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(formatDate(rental.dropoff_time, lang), 32, yPos);
    doc.setFontSize(9);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(`  ${_("dropoffLoc")}:`, 80, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(rental.dropoff_location || "—", 110, yPos);
  }
}

function drawPage2(
  doc: any,
  autoTable: any,
  contract: IContract,
  lang: Lang,
) {
  const _ = t(lang);
  const blueColor = [37, 99, 235];

  const outChecklist = contract.checklists?.find((cl) => cl.type === "OUT");
  const inChecklist = contract.checklists?.find((cl) => cl.type === "IN");
  const hasBoth = outChecklist && inChecklist;

  // Page header
  doc.setFontSize(13);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text(_("subtitle"), 105, 12, { align: "center" });

  doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.setLineWidth(0.3);
  doc.line(10, 16, 200, 16);

  let y = 22;

  if (hasBoth) {
    const colW = 94;

    doc.setFontSize(9);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(_("outChecklist"), 10, y);
    doc.text(_("inChecklist"), 106, y);
    y += 5;

    // Fuel pills
    doc.setFontSize(7);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(`${_("fuelLevel")}: ${outChecklist.fuel_percentage || "—"}`, 10, y);
    doc.text(`${_("fuelLevel")}: ${inChecklist.fuel_percentage || "—"}`, 106, y);
    y += 5;

    const outEnd = drawChecklistTable(doc, autoTable, outChecklist, 10, y, colW, lang, blueColor);
    const inEnd = drawChecklistTable(doc, autoTable, inChecklist, 106, y, colW, lang, blueColor);
    y = Math.max(outEnd, inEnd) + 4;

    // Signatures
    const sigW = 45;
    const sigY = y;
    addSig(doc, _("inspector"), outChecklist.inspector_signature, 10, sigY, sigW, blueColor);
    addSig(doc, _("driver"), outChecklist.driver_signature, 57, sigY, sigW, blueColor);
    addSig(doc, _("inspector"), inChecklist.inspector_signature, 106, sigY, sigW, blueColor);
    addSig(doc, _("driver"), inChecklist.driver_signature, 153, sigY, sigW, blueColor);
  } else if (outChecklist) {
    doc.setFontSize(9);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(_("outChecklist"), 10, y);
    y += 5;

    doc.setFontSize(7);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(`${_("fuelLevel")}: ${outChecklist.fuel_percentage || "—"}`, 10, y);
    y += 5;

    y = drawChecklistTable(doc, autoTable, outChecklist, 10, y, 190, lang, blueColor) + 4;

    const sigW = 90;
    addSig(doc, _("inspector"), outChecklist.inspector_signature, 10, y, sigW, blueColor);
    addSig(doc, _("driver"), outChecklist.driver_signature, 110, y, sigW, blueColor);
  } else if (inChecklist) {
    doc.setFontSize(9);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(_("inChecklist"), 10, y);
    y += 5;

    doc.setFontSize(7);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(`${_("fuelLevel")}: ${inChecklist.fuel_percentage || "—"}`, 10, y);
    y += 5;

    y = drawChecklistTable(doc, autoTable, inChecklist, 10, y, 190, lang, blueColor) + 4;

    const sigW = 90;
    addSig(doc, _("inspector"), inChecklist.inspector_signature, 10, y, sigW, blueColor);
    addSig(doc, _("driver"), inChecklist.driver_signature, 110, y, sigW, blueColor);
  }

  // Footer on page 2
  doc.setFontSize(6);
  doc.setTextColor(156, 163, 175);
  doc.text(`${_("page")} 2 / 2`, 105, 294, { align: "center" });
}

function drawChecklistTable(
  doc: any,
  autoTable: any,
  checklist: any,
  x: number,
  y: number,
  w: number,
  lang: Lang,
  blueColor: number[],
): number {
  const _ = t(lang);

  const rows = Object.keys(FIELD_LABELS).map((key) => {
    const value = checklist[key];
    const obs = checklist.observations?.[key] || "";
    const label = FIELD_LABELS[key][lang];
    return [label, value === true ? _("yes") : _("no"), obs || "—"];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: x, right: 210 - x - w },
    tableWidth: w,
    head: [[_("item"), "", _("obs")]],
    body: rows,
    headStyles: {
      fillColor: [blueColor[0], blueColor[1], blueColor[2]],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 6.5,
      cellPadding: 1.5,
    },
    bodyStyles: { fontSize: 6, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: w - 34 },
      1: { cellWidth: 14, halign: "center" },
      2: { cellWidth: 20 },
    },
    alternateRowStyles: { fillColor: [239, 246, 255] },
    theme: "grid",
    tableLineColor: [191, 219, 254],
    tableLineWidth: 0.1,
  });

  return (doc as any).lastAutoTable.finalY + 2;
}

function addSig(
  doc: any,
  label: string,
  dataUrl: string | null,
  x: number,
  y: number,
  w: number,
  blueColor: number[],
) {
  if (!dataUrl) return;
  doc.setFontSize(6);
  doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.text(label, x + w / 2, y, { align: "center" });
  doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
  doc.setLineWidth(0.1);
  doc.rect(x + 3, y + 2, w - 6, 18);
  try {
    doc.addImage(dataUrl, "PNG", x + 4, y + 3, w - 8, 16);
  } catch {
    // ignore
  }
}

export async function downloadContractPdf(contract: IContract) {
  const lang: Lang =
    (typeof window !== "undefined" &&
      (window.localStorage.getItem("language") as Lang)) ||
    "es";
  const _ = t(lang);

  const jsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("helvetica", "normal");

  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadImageAsDataUrl("/logo.png");
  } catch {
    // no logo — fallback text
  }

  // Page 1: Receipt-style contract overview
  drawPage1(doc, contract, lang, logoDataUrl);

  // Page footer
  doc.setFontSize(6);
  doc.setTextColor(156, 163, 175);
  doc.text(`${_("page")} 1 / 2`, 105, 294, { align: "center" });

  // Page 2: Checklists
  doc.addPage();
  drawPage2(doc, autoTable, contract, lang);

  doc.save(`contrato-${contract.id.slice(0, 8)}.pdf`);
}
