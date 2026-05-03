"use client";
import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ReaderToolbar } from "@/components/reader/ReaderToolbar";
import { useReaderStore } from "@/store/readerStore";
import type { Book, ReadingProgress } from "@/types";

import { useAuth } from "@clerk/nextjs";

// epub.js MUST be client-side only
const EPUBReader = dynamic(
  () => import("@/components/reader/EPUBReader").then((m) => m.EPUBReader),
  { ssr: false, loading: () => null }
);

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { userId, isLoaded } = useAuth();
  const [progress, setProgress] = useState(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, viewMode, currentPage, totalPages, setCurrentPage, setTotalPages } = useReaderStore();

  const { data: book } = useQuery<Book>({
    queryKey: ["book", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { data: savedProgress } = useQuery<ReadingProgress | null>({
    queryKey: ["progress", userId, bookId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/progress/${userId}`);
      const all: ReadingProgress[] = await res.json();
      return all.find((p) => p.bookId === bookId) ?? null;
    },
    enabled: !!bookId && !!userId,
  });

  const saveProgress = useCallback(
    async (cfi: string, page: number, total: number, timeSpentDelta: number, excerpt: string) => {
      const pct = total > 0 ? page / total : 0;
      setProgress(pct);

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (!userId) return;
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              bookId,
              progress: pct,
              lastCfi: cfi,
              lastExcerpt: excerpt,
              currentPage: page,
              totalPages: total,
              timeSpentDelta,
            }),
          });
        } catch (e) {
          console.error("Failed to save progress:", e);
        }
      }, 2000);
    },
    [bookId, userId]
  );

  const handleBookmark = async () => {
    if (!userId || !savedProgress?.lastCfi) return;
    try {
      await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          bookId,
          cfiRange: savedProgress.lastCfi,
          text: savedProgress.lastExcerpt || "Bookmarked Location",
          color: "bookmark"
        })
      });
      alert("Page bookmarked successfully!");
    } catch (e) {
      console.error("Failed to save bookmark:", e);
    }
  };

  const themeClass =
    theme === "dark"
      ? "bg-[#1C1C1E]"
      : theme === "sepia"
      ? "bg-[#F4ECD8]"
      : "bg-[#FFFEF8]";

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F3EF]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#E85D5D] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#6B6B6B]">Loading reader...</p>
        </div>
      </div>
    );
  }

  if (!book.epubUrl) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F3EF] flex-col gap-4">
        <p className="text-lg font-semibold text-[#1A1A1A]">No EPUB available</p>
        <p className="text-sm text-[#6B6B6B]">
          This book does not have an EPUB file attached yet.
        </p>
        <a
          href="/library"
          className="px-4 py-2 bg-[#E85D5D] text-white text-sm font-semibold rounded-xl hover:bg-[#D44B4B]"
        >
          Go to Library
        </a>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${themeClass} transition-colors duration-500 ease-in-out`}>
      {/* Floating Glassmorphic Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 transition-opacity duration-300 opacity-0 hover:opacity-100">
        <div className="bg-white/70 backdrop-blur-xl border-b border-black/5 shadow-sm">
          <ReaderToolbar
            bookTitle={book.title}
            bookId={book.id}
            currentPage={currentPage || savedProgress?.currentPage || 0}
            totalPages={totalPages || savedProgress?.totalPages || book.totalPages}
            progress={progress || savedProgress?.progress || 0}
            onPrev={() => {}}
            onNext={() => {}}
            onBookmark={handleBookmark}
          />
        </div>
      </div>

      {/* Reader Container */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 pt-20 pb-10 px-4 md:px-12 lg:px-20 transition-all duration-500">
          <div className="max-w-5xl mx-auto h-full relative">
            <EPUBReader
              key={`${book.id}-${viewMode}`}
              epubUrl={book.epubUrl}
              bookId={book.id}
              initialCfi={savedProgress?.lastCfi}
              onLocationChange={saveProgress}
              onReady={setTotalPages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
