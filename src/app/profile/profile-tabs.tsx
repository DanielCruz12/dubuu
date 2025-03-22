"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import PersonalInfoForm from "./personal-info-form";

export default function ProfileTabs() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <ProfileTabsSkeleton />;
  }

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <Card className="p-6">
          <PersonalInfoForm />
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ProfileTabsSkeleton() {
  return (
    <div className="w-full space-y-8">
      <div className="grid w-full grid-cols-3 gap-2">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
