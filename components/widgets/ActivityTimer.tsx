"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Timer } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface Props {
  userId: string;
  bookId?: string;
  onSessionEnd?: (duration: number) => void;
}

export function ActivityTimer({ userId, bookId, onSessionEnd }: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Load today's total from localStorage
  useEffect(() => {
    const key = `bv_today_${new Date().toDateString()}`;
    const stored = localStorage.getItem(key);
    if (stored) setTodayTotal(parseInt(stored));
  }, []);

  const start = async () => {
    startRef.current = Date.now();
    setRunning(true);

    if (bookId) {
      try {
        const res = await fetch("/api/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, bookId }),
        });
        const data = await res.json();
        sessionIdRef.current = data.id;
      } catch (e) {
        console.error(e);
      }
    }

    intervalRef.current = setInterval(() => {
      if (startRef.current) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
  };

  const stop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);

    const duration = elapsed;
    const newTotal = todayTotal + duration;
    setTodayTotal(newTotal);
    setElapsed(0);

    const key = `bv_today_${new Date().toDateString()}`;
    localStorage.setItem(key, String(newTotal));

    if (bookId) {
      try {
        await fetch("/api/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            duration,
            userId,
            bookId,
          }),
        });
      } catch (e) {
        console.error(e);
      }
    }

    onSessionEnd?.(duration);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const displayTime = running ? elapsed : todayTotal;
  const progress = Math.min((todayTotal / 3600) * 100, 100); // 1hr goal

  return (
    <div className="bg-white rounded-[20px] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#1A1A1A]">Reading Timer</h3>
        <Timer className="w-4 h-4 text-[#E85D5D]" />
      </div>

      {/* Time display */}
      <div className="text-center mb-4">
        <div
          className={`text-3xl font-bold tracking-tight mb-0.5 transition-colors ${
            running ? "text-[#E85D5D]" : "text-[#1A1A1A]"
          }`}
        >
          {formatTime(displayTime)}
        </div>
        <p className="text-xs text-[#9E9A94]">
          {running ? "Session in progress" : "Today's total"}
        </p>
      </div>

      {/* Daily progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#9E9A94] mb-1.5">
          <span>Daily goal</span>
          <span className="font-medium text-[#1A1A1A]">{formatTime(todayTotal)} / 1h</span>
        </div>
        <div className="h-2 bg-[#F0EDE7] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E85D5D] to-[#FF8A65] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!running ? (
          <button
            onClick={start}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E85D5D] text-white text-sm font-semibold rounded-xl hover:bg-[#D44B4B] transition-all shadow-[0_4px_12px_rgba(232,93,93,0.3)] hover:shadow-[0_6px_16px_rgba(232,93,93,0.4)] active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            Start session
          </button>
        ) : (
          <>
            <button
              onClick={stop}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1A1A1A] text-white text-sm font-semibold rounded-xl hover:bg-[#2D2D2D] transition-all active:scale-95"
            >
              <Pause className="w-4 h-4 fill-white" />
              Pause
            </button>
            <button
              onClick={stop}
              className="w-10 h-10 flex items-center justify-center bg-[#F0EDE7] text-[#6B6B6B] rounded-xl hover:bg-[#E0DCD5] transition-colors"
            >
              <Square className="w-4 h-4 fill-[#6B6B6B]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
