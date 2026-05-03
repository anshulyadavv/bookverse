"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarouselBook {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  genres?: string[];
  progress?: number;
  source?: string;
}

interface Props {
  title: string;
  books: CarouselBook[];
  showProgress?: boolean;
  href?: string;
}

export function BookCarousel({ title, books, showProgress, href }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 400; // Adjusted for better paging
    scrollRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-16 fade-in-up">
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <h3 className="text-2xl font-black text-[#1D1D1F] tracking-tight mb-1">{title}</h3>
          <div className="h-1 w-12 bg-black/5 rounded-full" />
        </div>
        
        <div className="flex items-center gap-4">
          {href && (
            <Link 
              href={href} 
              className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center gap-1.5 group/link"
            >
              See All
              <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          )}
          <div className="flex space-x-1.5">
            <button 
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-white shadow-sm border border-black/5 hover:bg-gray-50 transition-all active:scale-90"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={18} className="text-gray-400" />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-white shadow-sm border border-black/5 hover:bg-gray-50 transition-all active:scale-90"
              aria-label="Scroll Right"
            >
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex space-x-7 overflow-x-auto scroll-hide pb-10 pt-2 px-1 snap-x snap-mandatory"
      >
        {books.map((book, i) => (
          <Link
            key={book.id + i}
            href={book.source === "openlibrary" ? "#" : `/reader/${book.id}`}
            className="flex-shrink-0 group cursor-pointer block snap-start"
          >
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-40"
            >
              {/* Cover Container */}
              <div className="relative w-40 h-[240px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden mb-4 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                {book.cover ? (
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="160px"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full bg-gradient-to-tr flex items-center justify-center p-6",
                    i % 2 === 0 ? "from-slate-50 to-blue-50" : "from-stone-50 to-orange-50"
                  )}>
                    <BookOpen className="w-10 h-10 text-gray-200" />
                  </div>
                )}
                
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Text Meta */}
              <div className="px-1">
                <p className="font-black text-sm text-[#1D1D1F] truncate leading-tight mb-1 group-hover:text-[#007AFF] transition-colors">
                  {book.title}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">
                  {book.author}
                </p>
              </div>

              {/* Progress indicator (optional) */}
              {showProgress && book.progress !== undefined && (
                <div className="mt-3 px-1">
                  <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-black/20 rounded-full" 
                      style={{ width: `${book.progress * 100}%` }} 
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </Link>
        ))}

        {books.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full py-20 bg-black/5 rounded-[40px] border-2 border-dashed border-black/5">
            <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">No books available</p>
          </div>
        )}
        
        {/* End padding for scroll snap */}
        <div className="flex-shrink-0 w-1" />
      </div>
    </section>
  );
}
