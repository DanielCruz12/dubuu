export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-5 md:px-20 pb-10">{children}</div>;
}
