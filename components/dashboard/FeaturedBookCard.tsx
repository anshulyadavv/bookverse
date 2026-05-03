"use client";
import Image from "next/image";
import Link from "next/link";
import { Play, BookOpen } from "lucide-react";
import type { ReadingProgress } from "@/types";

interface Props {
  progress: ReadingProgress | null;
}

export function FeaturedBookCard({ progress }: Props) {
  if (!progress || !progress.book) {
    return (
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] p-6 min-h-[200px] flex items-center justify-center fade-in-up">
        <div className="text-center text-white/60">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No book in progress</p>
          <Link
            href="/library"
            className="mt-3 inline-block text-[#E85D5D] text-sm font-semibold hover:underline"
          >
            Browse your library →
          </Link>
        </div>
      </div>
    );
  }

  const { book, currentPage, totalPages, progress: pct } = progress;
  const percent = Math.round(pct * 100);

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1A1A2A] via-[#1A1A1A] to-[#2D1A1A] p-6 fade-in-up min-h-[200px]">
      {/* Background book cover blur */}
      {book.cover && (
        <div className="absolute inset-0 opacity-10">
          <Image
            src={book.cover}
            alt=""
            fill
            className="object-cover blur-xl scale-110"
            sizes="100%"
          />
        </div>
      )}

      <div className="relative flex gap-5 items-center">
        {/* Book cover */}
        <div className="shrink-0">
          {book.cover ? (
            <div className="relative w-[90px] h-[130px] rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] book-tilt">
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover"
                sizes="90px"
              />
            </div>
          ) : (
            <div className="w-[90px] h-[130px] rounded-xl bg-[#2D2D2D] flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white/30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="pulse-dot w-2 h-2 rounded-full bg-[#E85D5D] inline-block" />
            <span className="text-[#E85D5D] text-xs font-semibold uppercase tracking-wider">
              Currently Reading
            </span>
          </div>
          <h2 className="text-white text-xl font-bold leading-tight mb-1 truncate">
            {book.title}
          </h2>
          <p className="text-white/50 text-sm mb-4">by {book.author}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/60 text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-white text-xs font-bold">{percent}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E85D5D] to-[#FF8A65] rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <Link
            href={`/reader/${progress.bookId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E85D5D] text-white text-sm font-semibold rounded-xl hover:bg-[#D44B4B] transition-all duration-200 shadow-[0_4px_12px_rgba(232,93,93,0.35)] hover:shadow-[0_6px_20px_rgba(232,93,93,0.45)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Resume
          </Link>
        </div>
      </div>
    </div>
  );
}
