"use client";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import React from "react";

const Dashboard = () => {
  const { signOut } = useClerk();

  return (
    <div className="h-screen flex items-center justify-center">
      <Button onClick={() => signOut({ redirectUrl: "/" })}>Log out</Button>
    </div>
  );
};

export default Dashboard;
