import { DashboardTitle } from "@/components/dashboard-title";
import PersonalInfoForm from "@/components/personal-info-form";
import React from "react";

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
