"use client";
import Link from "next/link";
import { ChevronLeft, Settings2, Type, Book as BookIcon, Columns } from "lucide-react";

import { useState } from "react";
import { useReaderStore } from "@/store/readerStore";
import { cn } from "@/lib/utils";

interface Props {
  bookTitle: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  progress: number;
  onPrev: () => void;
  onNext: () => void;
  onBookmark: () => void;
}

export function ReaderToolbar({
  bookTitle,
  progress,
  onBookmark,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme, fontSize, setFontSize, viewMode, setViewMode } = useReaderStore();


  return (
    <div className="flex items-center justify-between px-6 py-4">
      {/* Left */}
      <div className="flex items-center gap-6 w-[250px]">
        <Link
          href="/dashboard"
          className="p-2 -ml-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-black transition-colors"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0 hidden md:block">
          <h1 className="text-sm font-semibold text-gray-900 truncate font-serif">
            {bookTitle}
          </h1>
          <p className="text-xs text-gray-500">
            {Math.round(progress * 100)}% read
          </p>
        </div>
      </div>

      {/* Center (Empty for symmetry) */}
      <div className="flex-1" />

      {/* Right Controls */}
      <div className="flex items-center gap-3 w-[250px] justify-end relative">
        <button
          onClick={onBookmark}
          className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-black transition-colors"
          aria-label="Bookmark page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><line x1="12" x2="12" y1="7" y2="13"/><line x1="15" x2="9" y1="10" y2="10"/></svg>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-black transition-colors"
          aria-label="Settings"
        >
          <Settings2 className="w-5 h-5" />
        </button>

        {showSettings && (
          <div className={cn(
            "absolute top-12 right-0 w-[320px] rounded-[18px] shadow-2xl p-5 z-50 transition-colors duration-200",
            theme === "dark" ? "bg-[#252525] border border-white/10" : 
            theme === "sepia" ? "bg-[#F4ECD8] border border-[#D5C1A3]" : 
            "bg-[#F9F9F9] border border-gray-200"
          )}>
            {/* Font Size */}
            <div className="mb-6">
              <div className={cn(
                "flex items-center justify-between rounded-xl p-1 shadow-sm",
                theme === "dark" ? "bg-[#3A3A3C]" : theme === "sepia" ? "bg-[#E6D5B8]" : "bg-gray-200/60"
              )}>
                <button
                  onClick={() => setFontSize(Math.max(50, fontSize - 10))}
                  className={cn(
                    "flex-1 py-2 flex justify-center rounded-lg transition-colors",
                    theme === "dark" ? "text-white hover:bg-[#4A4A4C]" : theme === "sepia" ? "text-[#5C4033] hover:bg-[#F4ECD8]" : "text-black hover:bg-white"
                  )}
                >
                  <span className="font-serif text-sm">A</span>
                </button>
                <div className={cn("w-14 text-center text-xs font-semibold select-none", theme === "dark" ? "text-gray-300" : theme === "sepia" ? "text-[#5C4033]/70" : "text-gray-500")}>
                  {fontSize}%
                </div>
                <button
                  onClick={() => setFontSize(Math.min(200, fontSize + 10))}
                  className={cn(
                    "flex-1 py-2 flex justify-center rounded-lg transition-colors",
                    theme === "dark" ? "text-white hover:bg-[#4A4A4C]" : theme === "sepia" ? "text-[#5C4033] hover:bg-[#F4ECD8]" : "text-black hover:bg-white"
                  )}
                >
                  <span className="font-serif text-lg font-bold">A</span>
                </button>
              </div>
            </div>

            {/* View Mode */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("single")}
                  className={cn(
                    "flex-1 py-2.5 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all text-xs font-medium shadow-sm",
                    viewMode === "single"
                      ? (theme === "dark" ? "bg-[#007AFF] text-white border-transparent" : "bg-white border-black text-black ring-1 ring-black")
                      : (theme === "dark" ? "bg-[#3A3A3C] text-gray-300 border-transparent hover:bg-[#4A4A4C]" : theme === "sepia" ? "bg-[#E6D5B8] text-[#5C4033] border-transparent" : "bg-white text-gray-600 border-gray-200")
                  )}
                >
                  <BookIcon className="w-4 h-4" />
                  Scroll
                </button>
                <button
                  onClick={() => setViewMode("double")}
                  className={cn(
                    "flex-1 py-2.5 flex flex-col items-center justify-center gap-1.5 rounded-xl border transition-all text-xs font-medium shadow-sm",
                    viewMode === "double"
                      ? (theme === "dark" ? "bg-[#007AFF] text-white border-transparent" : "bg-white border-black text-black ring-1 ring-black")
                      : (theme === "dark" ? "bg-[#3A3A3C] text-gray-300 border-transparent hover:bg-[#4A4A4C]" : theme === "sepia" ? "bg-[#E6D5B8] text-[#5C4033] border-transparent" : "bg-white text-gray-600 border-gray-200")
                  )}
                >
                  <Columns className="w-4 h-4" />
                  Pages
                </button>
              </div>
            </div>


            {/* Theme */}
            <div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex-1 h-12 rounded-xl border transition-all text-black bg-white flex flex-col items-center justify-center font-serif text-sm shadow-sm",
                    theme === "light"
                      ? "ring-2 ring-blue-500 border-transparent"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  Aa
                </button>
                <button
                  onClick={() => setTheme("sepia")}
                  className={cn(
                    "flex-1 h-12 rounded-xl border transition-all text-[#5C4033] bg-[#F4ECD8] flex flex-col items-center justify-center font-serif text-sm shadow-sm",
                    theme === "sepia"
                      ? "ring-2 ring-blue-500 border-transparent"
                      : "border-transparent hover:brightness-95"
                  )}
                >
                  Aa
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex-1 h-12 rounded-xl border transition-all text-gray-300 bg-[#1C1C1E] flex flex-col items-center justify-center font-serif text-sm shadow-sm",
                    theme === "dark"
                      ? "ring-2 ring-blue-500 border-transparent"
                      : "border-transparent hover:brightness-110"
                  )}
                >
                  Aa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
