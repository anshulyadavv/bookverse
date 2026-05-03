"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useReaderStore } from "@/store/readerStore";
import type { ReaderTheme } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface Props {
  epubUrl: string;
  bookId: string;
  initialCfi?: string | null;
  onLocationChange?: (cfi: string, page: number, total: number, timeSpentDelta: number, excerpt: string) => void;
  onReady?: (totalPages: number) => void;
}

type EpubBook = {
  renderTo: (el: HTMLElement | string, options: object) => EpubRendition;
  locations: {
    generate: (chars: number) => Promise<void>;
    percentageFromCfi: (cfi: string) => number;
    locationFromCfi: (cfi: string) => { start: { location: number } };
    total: number;
  };
};

type EpubRendition = {
  display: (target?: string) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  off: (event: string, cb: (...args: unknown[]) => void) => void;
  themes: {
    default: (styles: object) => void;
    select: (theme: string) => void;
    register: (name: string, styles: object) => void;
    fontSize: (size: string) => void;
  };
  destroy: () => void;
};

export function EPUBReader({ epubUrl, bookId, initialCfi, onLocationChange, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<EpubBook | null>(null);
  const renditionRef = useRef<EpubRendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHighlightMenu, setShowHighlightMenu] = useState<{ cfiRange: string, top: number, left: number } | null>(null);
  const { userId } = useAuth();
  const { theme, fontSize, viewMode, setCurrentPage, setTotalPages, currentPage, totalPages } = useReaderStore();


  
  const sessionStartTimeRef = useRef<number>(Date.now());
  const accumulatedTimeRef = useRef<number>(0);
  const lastSavedTimeRef = useRef<number>(Date.now());
  const [transitionState, setTransitionState] = useState<"idle" | "turning-next" | "turning-prev">("idle");

  const initReader = useCallback(async () => {
    if (!containerRef.current || !epubUrl) return;

    try {
      setLoading(true);
      if (containerRef.current) {
        containerRef.current.innerHTML = ""; // Clear existing iframes
      }
      const ePub = (await import("epubjs")).default;
      const book = ePub(epubUrl) as unknown as EpubBook;
      bookRef.current = book;

      const rendition = book.renderTo(containerRef.current, {
        width: "100%",
        height: "100%",
        flow: "paginated",
        manager: "default",
        spread: viewMode === "double" ? "always" : "none",
      });

      renditionRef.current = rendition;

      // Apply initial styling overrides instead of buggy theme registration
      const initialColor = theme === "dark" ? "#E5E5EA" : theme === "sepia" ? "#3D2B1A" : "#1A1A1A";
      rendition.themes.override("color", initialColor, true);
      rendition.themes.override("background", "transparent", true);
      rendition.themes.fontSize(`${fontSize}%`);

      // Display at saved position or start
      if (initialCfi) {
        await rendition.display(initialCfi);
      } else {
        await rendition.display();
      }

      rendition.resize();

      setLoading(false);

      // Generate locations for progress tracking in background
      book.locations.generate(1024).then(() => {
        const total = book.locations.total;
        setTotalPages(total);
        onReady?.(total);
        
        // Re-calculate current page now that we have locations
        const currentLoc = rendition.currentLocation();
        if (currentLoc?.start?.cfi) {
          const loc = book.locations.locationFromCfi(currentLoc.start.cfi);
          if (loc?.start?.location) {
             setCurrentPage(loc.start.location);
          }
        }
      });

      // Track location changes
      const onRelocated = async (loc: any) => {
        const cfi = loc.start.cfi;
        
        let locationNum = 1;
        let total = totalPages > 0 ? totalPages : 1;

        if (book.locations && book.locations.total > 0) {
          total = book.locations.total;
          try {
            const locData = book.locations.locationFromCfi(cfi);
            if (locData && locData.start && locData.start.location) {
              locationNum = locData.start.location;
            } else {
              const percentage = book.locations.percentageFromCfi(cfi);
              if (percentage > 0) locationNum = Math.round(percentage * total);
            }
          } catch (e) {
             console.error("Error reading locationFromCfi", e);
          }
        } else {
          // If locations aren't fully generated, approximate
          const currentLoc = rendition.currentLocation();
          if (currentLoc && currentLoc.start && currentLoc.start.index !== undefined) {
             locationNum = currentLoc.start.index + 1;
          }
        }
        
        locationNum = Math.max(1, locationNum); // Ensure at least page 1
        
        const now = Date.now();
        const deltaSecs = Math.floor((now - lastSavedTimeRef.current) / 1000);
        lastSavedTimeRef.current = now;
        
        let excerpt = "";
        try {
          const range = rendition.getRange(cfi);
          if (range) {
            const text = range.toString().trim();
            if (text.length > 0) {
              excerpt = text.substring(0, 150) + (text.length > 150 ? "..." : "");
            }
          }
        } catch (e) {
          // Synchronous fallback failed
        }

        if (!excerpt) {
          try {
            const asyncRange = await book.getRange(cfi);
            if (asyncRange) {
              const text = asyncRange.toString().trim();
              if (text.length > 0) {
                 excerpt = text.substring(0, 150) + (text.length > 150 ? "..." : "");
              }
            }
          } catch (e) {
            console.error("Failed to extract excerpt asynchronously", e);
          }
        }

        setCurrentPage(locationNum);
        onLocationChange?.(cfi, locationNum, total, deltaSecs, excerpt);
      };

      rendition.on("relocated", onRelocated);

      // Highlighting logic
      const onSelected = (cfiRange: string, contents: any) => {
        const selection = contents.window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setShowHighlightMenu({
            cfiRange,
            top: rect.top + 50,
            left: rect.left + rect.width / 2
          });
        }
      };
      rendition.on("selected", onSelected);

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") rendition.next();
        if (e.key === "ArrowLeft") rendition.prev();
      };
      window.addEventListener("keydown", handleKey);

      return () => {
        rendition.off("relocated", onRelocated);
        rendition.off("selected", onSelected);
        window.removeEventListener("keydown", handleKey);
        rendition.destroy();
      };
    } catch (err) {
      setError("Failed to load EPUB. Please make sure the file is valid. Check console for details.");
      setLoading(false);
      console.error("Reader Init Error:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epubUrl, bookId, viewMode]); // Re-init if book or viewMode changes


  useEffect(() => {
    const cleanup = initReader();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [initReader]);

  // Apply theme changes dynamically via override
  useEffect(() => {
    if (renditionRef.current) {
      const color = theme === "dark" ? "#E5E5EA" : theme === "sepia" ? "#3D2B1A" : "#1A1A1A";
      renditionRef.current.themes.override("color", color, true);
      renditionRef.current.themes.override("background", "transparent", true);
    }
  }, [theme]);

  // Apply font size and spread changes
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize]);

  useEffect(() => {
    const handleResize = () => {
      renditionRef.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const next = async () => {
    if (renditionRef.current) {
      setTransitionState("turning-next");
      await new Promise(r => setTimeout(r, 150));
      await renditionRef.current.next();
      setTransitionState("idle");
    }
  };
  const prev = async () => {
    if (renditionRef.current) {
      setTransitionState("turning-prev");
      await new Promise(r => setTimeout(r, 150));
      await renditionRef.current.prev();
      setTransitionState("idle");
    }
  };

  // Expose navigation via data attributes for toolbar
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as HTMLElement & { epubNext?: () => void; epubPrev?: () => void }).epubNext = next;
      (containerRef.current as HTMLElement & { epubPrev?: () => void }).epubPrev = prev;
    }
  });

  const saveHighlight = async (color: string) => {
    if (!showHighlightMenu || !renditionRef.current) return;
    
    const { cfiRange } = showHighlightMenu;
    setShowHighlightMenu(null);

    try {
      // @ts-ignore
      renditionRef.current.annotations.highlight(cfiRange, {}, () => {});
      
      let text = "";
      try {
        const range = await bookRef.current?.getRange(cfiRange);
        text = range ? range.toString() : "";
      } catch (e) {}

      await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "guest",
          bookId,
          cfiRange,
          text,
          color
        })
      });
    } catch (e) {
      console.error("Failed to save highlight", e);
    }
  };

  return (
    <div className="relative w-full h-full">
      {showHighlightMenu && (
        <div 
          className="absolute z-50 bg-white shadow-xl border border-gray-200 rounded-xl px-2 py-1.5 flex gap-2 items-center"
          style={{ top: showHighlightMenu.top, left: showHighlightMenu.left, transform: 'translateX(-50%)' }}
        >
          <button onClick={() => saveHighlight("yellow")} className="w-6 h-6 rounded-full bg-yellow-300 hover:scale-110 transition-transform shadow-sm" aria-label="Highlight Yellow" />
          <button onClick={() => saveHighlight("green")} className="w-6 h-6 rounded-full bg-green-300 hover:scale-110 transition-transform shadow-sm" aria-label="Highlight Green" />
          <button onClick={() => saveHighlight("blue")} className="w-6 h-6 rounded-full bg-blue-300 hover:scale-110 transition-transform shadow-sm" aria-label="Highlight Blue" />
          <button onClick={() => saveHighlight("pink")} className="w-6 h-6 rounded-full bg-pink-300 hover:scale-110 transition-transform shadow-sm" aria-label="Highlight Pink" />
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button onClick={() => setShowHighlightMenu(null)} className="text-xs text-gray-400 hover:text-black font-semibold px-1">Cancel</button>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E85D5D] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B6B6B] font-medium">Loading book...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5F3EF]">
          <div className="text-center max-w-xs px-4">
            <p className="text-[#E85D5D] font-semibold mb-2">⚠️ Load Error</p>
            <p className="text-sm text-[#6B6B6B]">{error}</p>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        id="epub-container"
        className={`w-full h-full epub-${theme} transition-all duration-300 ${
          transitionState === "turning-next" ? "-translate-x-4 opacity-50" :
          transitionState === "turning-prev" ? "translate-x-4 opacity-50" :
          "translate-x-0 opacity-100"
        } ${loading ? "opacity-0" : ""}`}
        style={{ 
          minHeight: "100%",
          width: "100%",
          backgroundColor: theme === 'dark' ? '#1C1C1E' : theme === 'sepia' ? '#F4ECD8' : '#FFFEF8'
        }}
      />

      {/* Page Numbers & Progress */}
      {!loading && !error && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center items-center pointer-events-none">
          <div className="bg-black/5 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Page {currentPage} of {totalPages > 0 ? totalPages : '...'}
          </div>
        </div>
      )}

      {/* Nav arrow overlays (Edge tap zones) */}
      {!loading && !error && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-0 bottom-0 w-[20%] max-w-[150px] z-10 cursor-pointer outline-none tap-highlight-transparent group flex items-center justify-start pl-6"
            aria-label="Previous Page"
          >
             <div className="w-12 h-12 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm flex items-center justify-center text-black/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                 <ChevronLeft className="w-6 h-6" />
             </div>
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-0 bottom-0 w-[20%] max-w-[150px] z-10 cursor-pointer outline-none tap-highlight-transparent group flex items-center justify-end pr-6"
            aria-label="Next Page"
          >
             <div className="w-12 h-12 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm flex items-center justify-center text-black/50 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                 <ChevronRight className="w-6 h-6" />
             </div>
          </button>
        </>
      )}
    </div>
  );
}
