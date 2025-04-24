"use client";

import { useGetUsersQuery } from "@/redux/slices/user/user-slice";

export default function Home() {
  const { data, isLoading } = useGetUsersQuery({});

  if (isLoading) return <p>Cargando usuarios...</p>;

  console.log(data);
  return (
    <section className="px-5 md:px-20">
      <h1 className="mb-2 text-xl font-normal ">Welcome to My Website</h1>
      <p className="text-muted-foreground">
        This is an empty page with a fixed header and footer. The content area
        will adapt to fill the available space between them.
      </p>
    </section>
  );
}
