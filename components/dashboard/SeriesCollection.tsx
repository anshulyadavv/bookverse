"use client";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { Book } from "@/types";

interface Props {
  books: Book[];
}

function groupBySeries(books: Book[]): Record<string, Book[]> {
  const grouped: Record<string, Book[]> = {};
  for (const book of books) {
    if (book.series) {
      if (!grouped[book.series]) grouped[book.series] = [];
      grouped[book.series].push(book);
    }
  }
  return grouped;
}

export function SeriesCollection({ books }: Props) {
  const grouped = groupBySeries(books);
  const entries = Object.entries(grouped).slice(0, 3); // Just show top 3 for the dashboard

  if (entries.length === 0) return null;

  return (
    <div className="fade-in-up">
      <h2 className="text-xl font-bold text-black tracking-tight mb-8">Series Collection</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(([series, seriesBooks]) => (
          <motion.div
            key={series}
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass rounded-[24px] p-4 flex items-center gap-6 cursor-pointer hover:shadow-lg transition-all duration-300 group"
          >
            {/* Stacked covers */}
            <div className="relative shrink-0 w-[80px] h-[72px]">
              {seriesBooks.slice(0, 3).map((b, i) => (
                <div
                  key={b.id}
                  className="absolute w-[44px] h-[64px] rounded-lg overflow-hidden border border-white shadow-sm transition-transform duration-500"
                  style={{
                    left: `${i * 12}px`,
                    top: `${i * 2}px`,
                    zIndex: 3 - i,
                  }}
                >
                  {b.cover ? (
                    <Image src={b.cover} alt={b.title} fill className="object-cover" sizes="44px" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-gray-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="min-w-0">
              <h3 className="text-black font-bold text-sm leading-tight mb-1 group-hover:text-[#007AFF] transition-colors line-clamp-1">
                {series}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {seriesBooks.length} Books
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
