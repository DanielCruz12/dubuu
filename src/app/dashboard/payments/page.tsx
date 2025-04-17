import React from "react";
import { PaymentForm } from "./(forms)/deposit-form";
import { DashboardTitle } from "../(components)/dashboard-title";

const Payments = () => {
  return (
    <>
      <DashboardTitle
        heading="Información de pago existente"
        description="Ya tienes un método de pago configurado. Puedes continuar con
              estos datos o actualizarlos."
      />
      <PaymentForm />
    </>
  );
};

export default Payments;
