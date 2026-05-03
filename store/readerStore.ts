import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReaderTheme } from "@/types";

interface ReaderState {
  theme: ReaderTheme;
  fontSize: number;
  currentCfi: string | null;
  currentPage: number;
  totalPages: number;
  isTimerRunning: boolean;
  sessionStartTime: number | null;
  viewMode: "single" | "double";


  setTheme: (theme: ReaderTheme) => void;
  setFontSize: (size: number) => void;
  setCurrentCfi: (cfi: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  startTimer: () => void;
  stopTimer: () => number; // returns elapsed seconds
  setViewMode: (mode: "single" | "double") => void;
}


export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      theme: "light",
      fontSize: 16,
      currentCfi: null,
      currentPage: 0,
      totalPages: 0,
      isTimerRunning: false,
      sessionStartTime: null,
      viewMode: "single",


      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCurrentCfi: (currentCfi) => set({ currentCfi }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setTotalPages: (totalPages) => set({ totalPages }),
      startTimer: () =>
        set({ isTimerRunning: true, sessionStartTime: Date.now() }),
      stopTimer: () => {
        const { sessionStartTime } = get();
        if (!sessionStartTime) return 0;
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        set({ isTimerRunning: false, sessionStartTime: null });
        return elapsed;
      },
      setViewMode: (viewMode) => set({ viewMode }),
    }),

    {
      name: "bookverse-reader",
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        viewMode: state.viewMode,
      }),

    }
  )
);
