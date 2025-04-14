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
  return <div>{children}</div>;
}
