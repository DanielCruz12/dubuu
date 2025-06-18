import { DashboardTitle } from "@/components/dashboard-title";
import PersonalInfoForm from "@/components/personal-info-form";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Perfil de Usuario",
  description: "Gestiona tu información personal y preferencias en tu perfil.",
};

export default function ProfilePage() {
  return (
    <div className="px-3 md:px-0">
      <DashboardTitle
        heading="Perfil"
        description="Gestiona tu información personal"
      />
      <PersonalInfoForm />
    </div>
  );
}
