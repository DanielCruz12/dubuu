import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="mx-auto px-3 max-w-7xl min-h-screen pt-5">
      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <div>
              <UserProfile routing="hash" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
