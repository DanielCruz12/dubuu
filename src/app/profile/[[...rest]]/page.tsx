import ProfileTabs from "../profile-tabs";

export default function ProfilePage() {
  return (
    <div className="mx-auto px-3 md:px-0">
      <div className="mb-2">
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <ProfileTabs />
    </div>
  );
}
