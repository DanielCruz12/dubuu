import { DashboardTitle } from "@/components/dashboard-title";
import PersonalInfoForm from "@/components/personal-info-form";

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
