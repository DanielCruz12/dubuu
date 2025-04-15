"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(82vh)] flex justify-center items-center px-3 md:px-0">
      <SignIn />
  </div>
  );
}
