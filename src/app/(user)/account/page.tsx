import { DashboardTitle } from "@/components/dashboard-title";
import PersonalInfoForm from "@/components/personal-info-form";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Perfil de Usuario",
  description: "Gestiona tu información personal y preferencias en tu perfil.",
};

const UserPage = () => {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Perfil"
        description="Gestiona tu información personal"
      />
      <PersonalInfoForm />
    </div>
  );
};

export default UserPage;
