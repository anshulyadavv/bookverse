"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Activity,
  Bookmark,
  Settings
} from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: BookOpen, label: "Library", href: "/library" },
  { icon: Activity, label: "Activity", href: "/activity" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-col p-6 space-y-8 bg-transparent z-40">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-3 px-2 mb-4 group transition-transform hover:scale-[1.02]"
        >
          <div className="w-8 h-8 bg-[#E5DCC9] rounded-lg flex items-center justify-center shadow-sm">
            <BookOpen size={18} className="text-[#3A332C]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#3A332C]">BookVerse</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-300 group",
                  active 
                    ? "bg-[#E6E2D8] shadow-sm text-[#3A332C]" 
                    : "text-[#8C7A6B] hover:bg-[#E6E2D8]/50 hover:text-[#3A332C]"
                )}
              >
                <Icon size={20} className={cn("transition-colors", active ? "text-[#3A332C]" : "text-[#8C7A6B] group-hover:text-[#3A332C]")} strokeWidth={active ? 2.5 : 2} />
                <span className="font-semibold text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="pt-4 border-t border-black/5">
          <Link
            href="/settings"
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-full transition-all duration-200 text-[#8C7A6B] hover:bg-[#E6E2D8]/50 hover:text-[#3A332C]",
              pathname.startsWith("/settings") && "bg-[#E6E2D8] shadow-sm text-[#3A332C]"
            )}
          >
            <Settings size={20} strokeWidth={2} />
            <span className="font-semibold text-sm">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#F3EFE9]/90 backdrop-blur-xl border-t border-black/5 flex justify-around items-center p-3 pb-safe z-50">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                active ? "text-black" : "text-gray-400 hover:text-black"
              )}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center p-2 rounded-lg transition-colors",
            pathname.startsWith("/settings") ? "text-black" : "text-gray-400 hover:text-black"
          )}
        >
          <Settings size={24} strokeWidth={pathname.startsWith("/settings") ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Settings</span>
        </Link>
      </nav>
    </>
  );
}
