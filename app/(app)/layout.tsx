import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <div className="max-w-2xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
