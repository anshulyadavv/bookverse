"use client";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, TrendingUp } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { ReadingProgress } from "@/types";

interface Props {
  progress: ReadingProgress[];
}

function ProgressRing({ percent }: { percent: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width="72" height="72" className="shrink-0">
      <circle
        cx="36" cy="36" r={r}
        strokeWidth="5"
        stroke="#EDEAE4"
        fill="none"
      />
      <circle
        cx="36" cy="36" r={r}
        strokeWidth="5"
        stroke="url(#progressGrad)"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        className="transition-all duration-700"
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E85D5D" />
          <stop offset="100%" stopColor="#FF8A65" />
        </linearGradient>
      </defs>
      <text
        x="36" y="36"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold fill-[#1A1A1A]"
        style={{ fontSize: "11px", fontWeight: 700 }}
      >
        {percent}%
      </text>
    </svg>
  );
}

export function ReadingProgressCard({ progress }: Props) {
  const activeProgress = progress.filter((p) => p.progress < 1);
  const top = activeProgress[0];

  if (!top || !top.book) {
    return (
      <div className="bg-white rounded-[20px] p-4 xl:p-5 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Reading Progress</h3>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <BookOpen className="w-8 h-8 text-[#D0CCC4] mb-2" />
          <p className="text-xs text-[#B0ABA4]">No books in progress</p>
          <Link href="/library" className="mt-2 text-xs text-[#E85D5D] font-medium hover:underline">
            Start reading →
          </Link>
        </div>
      </div>
    );
  }

  const percent = Math.round(top.progress * 100);

  return (
    <div className="bg-white rounded-[20px] p-4 xl:p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Reading Progress</h3>
        <TrendingUp className="w-4 h-4 text-[#E85D5D]" />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <ProgressRing percent={percent} />
        <div className="min-w-0">
          <p className="text-[#1A1A1A] text-sm font-semibold leading-tight line-clamp-2 mb-1">
            {top.book.title}
          </p>
          <p className="text-[#9E9A94] text-xs">by {top.book.author}</p>
          <p className="text-[#1A1A1A] text-xs font-medium mt-1">
            <span className="text-[#E85D5D] font-bold">{top.currentPage}</span>{" "}
            / {top.totalPages} pages
          </p>
        </div>
      </div>

      {/* All books progress */}
      {activeProgress.length > 1 && (
        <div className="border-t border-[#F0EDE7] pt-4 space-y-3">
          {activeProgress.slice(1, 4).map((p) => (
            <div key={p.id}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-[#6B6B6B] font-medium truncate flex-1 mr-2">
                  {p.book?.title}
                </p>
                <span className="text-xs font-bold text-[#1A1A1A]">
                  {Math.round(p.progress * 100)}%
                </span>
              </div>
              <div className="h-1 bg-[#F0EDE7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E85D5D] to-[#FF8A65] rounded-full"
                  style={{ width: `${Math.round(p.progress * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Time spent */}
      <div className="mt-4 flex items-center gap-2 text-xs text-[#9E9A94] border-t border-[#F0EDE7] pt-4">
        <Clock className="w-3.5 h-3.5" />
        <span>Total time: <strong className="text-[#1A1A1A]">{formatTime(top.timeSpent)}</strong></span>
      </div>
    </div>
  );
}
