"use client";

import React from "react";
import { PaymentForm } from "./(forms)/payment-form";
import { DashboardTitle } from "@/components/dashboard-title";
import { useLanguage } from "@/lib/i18n-context";

const Payments = () => {
  const { t } = useLanguage();

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading={t("dashboard.payments.title")}
        description={t("dashboard.payments.description")}
      />
      <PaymentForm />
    </div>
  );
};

export default Payments;
