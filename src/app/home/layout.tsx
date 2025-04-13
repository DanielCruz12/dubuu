export const metadata = {
  title: "dantour - Your Travel Companion",
  description: "Discover amazing destinations and book your next adventure",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
