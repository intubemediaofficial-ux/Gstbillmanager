import ClientSidebar from "@/components/ClientSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar />
      <main className="ml-[250px] flex-1 p-6">{children}</main>
    </div>
  );
}
