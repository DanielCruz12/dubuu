"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(82vh)] flex justify-center items-center px-3 md:px-0">
      <SignUp />
  </div>
  );
}
