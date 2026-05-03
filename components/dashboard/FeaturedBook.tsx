"use client";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import type { ReadingProgress } from "@/types";

interface Props {
  currentBook: ReadingProgress | null;
}

export function FeaturedBook({ currentBook }: Props) {
  if (!currentBook) return null;

  const rawText = currentBook.lastExcerpt || currentBook.book.description || "You are currently making great progress in this story. Continue reading to discover what happens next in this immersive world.";
  const cleanText = rawText.replace(/<[^>]*>?/gm, '').replace(/^["'\s]+|["'\s]+$/g, '');

  return (
    <section className="relative p-2 md:p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-10">
      {/* Book Visual */}
      <motion.div 
        initial={{ rotateY: 0 }}
        whileHover={{ rotateY: -2, scale: 1.03 }}
        className="relative group shrink-0"
      >
        <div className="relative w-48 h-72 rounded-lg shadow-2xl overflow-hidden z-10 border border-white/20">
          {currentBook.book.cover ? (
            <Image
              src={currentBook.book.cover}
              alt={currentBook.book.title}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-rose-600 flex items-end p-4">
               <p className="text-white font-black text-xl uppercase tracking-tighter leading-none">{currentBook.book.title}</p>
            </div>
          )}
        </div>
        {/* Soft Depth Shadow */}
        <div className="absolute -bottom-4 -right-4 w-48 h-72 bg-black/10 blur-2xl -z-10 rounded-lg"></div>
      </motion.div>

      {/* Book Info */}
      <div className="flex-1 space-y-5 text-center md:text-left">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#3A332C] mb-2 tracking-tight leading-tight">
            {currentBook.book.title}
          </h2>
          <p className="text-[#8C7A6B] text-lg font-medium">
            Author {currentBook.book.author}
          </p>
        </div>
        <p className="text-gray-600 leading-relaxed max-w-md font-medium text-sm italic line-clamp-3">
          {cleanText}
        </p>
        
        <div className="pt-2">
          <Link
            href={`/reader/${currentBook.bookId}`}
            className="inline-flex px-8 py-3 bg-[#E5DCC9] text-[#3A332C] rounded-full font-bold text-sm hover:bg-[#D4C8B2] transition-all active:scale-95 shadow-sm"
          >
            Continue Reading
          </Link>
        </div>
      </div>
    </section>
  );
}
