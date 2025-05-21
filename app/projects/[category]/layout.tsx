import ClientLayout from "./client-layout";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
