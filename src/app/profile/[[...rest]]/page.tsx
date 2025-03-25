import ProfileTabs from "../profile-tabs";

export default function ProfilePage() {
  return (
    <div className="mx-auto px-3 w-full max-w-7xl pt-5 h-screen">
      <div className="mb-8">
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <ProfileTabs />
    </div>
  );
}
