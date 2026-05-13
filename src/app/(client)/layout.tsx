import SmartSidebar from "@/components/SmartSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SmartSidebar />
      <main className="md:ml-[250px] flex-1 p-4 pt-16 md:pt-6 md:p-6">{children}</main>
    </div>
  );
}
