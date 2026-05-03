"use client";
import type { ReadingProgress, Book } from "@/types";
import { useEffect, useState } from "react";

interface Props {
  userName: string;
  currentBook?: (ReadingProgress & { book: Book }) | null;
}

export function HeaderGreeting({ userName, currentBook }: Props) {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17 && hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  return (
    <div className="fade-in-up">
      <h1 className="font-serif text-4xl md:text-5xl font-medium text-[#3A332C] leading-tight tracking-tight">
        {greeting}, {userName}
      </h1>
      <p className="text-[#8C7A6B] text-sm mt-2 font-medium tracking-wide">
        {currentBook 
          ? `Continuing your journey through ${currentBook.book?.title}.`
          : "Discover your next great adventure."}
      </p>
    </div>
  );
}
