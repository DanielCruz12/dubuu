import ProfileTabs from "../profile-tabs";

export default function ProfilePage() {
  return (
    <div className="min-h-[calc(82vh)] px-3 md:px-0">
      <div className="mb-2">
        <p className="text-muted-foreground">
          Administra los datos de tu cuenta
        </p>
      </div>
      <ProfileTabs />
    </div>
  );
}
