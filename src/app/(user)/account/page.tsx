"use client";

import { DashboardTitle } from "@/components/dashboard-title";
import PersonalInfoForm from "@/components/personal-info-form";
import { useLanguage } from "@/lib/i18n-context";
import React from "react";

const UserPage = () => {
  const { t } = useLanguage();

  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading={t("dashboard.profile.heading")}
        description={t("dashboard.profile.description")}
      />
      <PersonalInfoForm />
    </div>
  );
};

export default UserPage;
