import { Sidebar } from "@/components/layout/Sidebar";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-[#F5F3EF]">
      <Sidebar />
      <main className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#FDF1F1] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-[#E85D5D]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Settings</h1>
          <p className="text-[#6B6B6B] text-sm">Customize your reading experience.</p>
        </div>
      </main>
    </div>
  );
}
