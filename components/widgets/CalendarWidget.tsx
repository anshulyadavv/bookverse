"use client";
import { format, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReadingSession } from "@/types";

interface Props {
  sessions: ReadingSession[];
}

export function CalendarWidget({ sessions }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const weekStart = addDays(startOfWeek(today, { weekStartsOn: 0 }), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hasSession = (date: Date) =>
    sessions.some((s) => isSameDay(new Date(s.date), date));

  return (
    <div className="bg-transparent border-t border-gray-100 pt-10 mt-10">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-3xl font-serif font-semibold text-black tracking-tight">Reading Schedule</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            disabled={weekOffset >= 0}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-all disabled:opacity-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Horizontal Days grid */}
      <div className="flex items-center justify-between bg-gray-50/50 rounded-3xl p-6">
        {days.map((day, i) => {
          const isCurrent = isToday(day);
          const hadSession = hasSession(day);
          
          return (
            <div key={i} className="flex flex-col items-center gap-4">
              <span className={cn(
                "text-[10px] font-black tracking-[0.1em] uppercase",
                isCurrent ? "text-[#007AFF]" : "text-gray-400"
              )}>
                {format(day, "E")}
              </span>
              <div
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-black transition-all",
                  isCurrent
                    ? "bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/30 scale-110"
                    : "bg-white text-black shadow-sm"
                )}
              >
                {format(day, "d")}
                {hadSession && !isCurrent && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
