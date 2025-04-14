// app/home/layout.tsx
export const metadata = {
  title: "Home - dantour",
  description: "Your personalized travel dashboard",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col min-h-screen">{children}</div>;
}
