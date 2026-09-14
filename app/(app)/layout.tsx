import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">{children}</div>
      </main>
    </div>
  );
}