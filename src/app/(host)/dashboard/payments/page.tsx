import React from "react";
import { PaymentForm } from "./(forms)/payment-form";
import { DashboardTitle } from "@/components/dashboard-title";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Información de Pago",
  description: "Para recibir pagos, debes decirnos a dónde enviar el dinero.",
};

const Payments = () => {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Información de pago"
        description="Para recibir pagos, debes decirnos a dónde enviar el dinero."
      />
      <PaymentForm />
    </div>
  );
};

export default Payments;
