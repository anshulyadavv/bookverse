"use client";
import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/library?search=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 transition-all duration-300 rounded-full border border-transparent",
          focused
            ? "bg-white border-black shadow-lg shadow-black/5"
            : "bg-gray-200/50 hover:bg-gray-200"
        )}
      >
        <Search className={cn("w-4 h-4 shrink-0 transition-colors", focused ? "text-black" : "text-gray-400")} strokeWidth={2.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search..."
          className="bg-transparent outline-none text-xs text-black placeholder-gray-400 w-full font-bold tracking-wide"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  );
}
