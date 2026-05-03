"use client";
import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  Upload, BookOpen, Search, Grid, List, X, Plus, Clock, Tag
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import type { Book } from "@/types";
import { useSearchParams } from "next/navigation";

const GENRES = ["All", "Fantasy", "Science Fiction", "Mystery", "Classic", "Adventure", "Philosophy"];

export default function LibraryPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [genre, setGenre] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [uploadForm, setUploadForm] = useState({
    title: "", author: "", genres: "", series: "", description: ""
  });
  const [epubFile, setEpubFile] = useState<File | null>(null);

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["books", search, genre],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (genre !== "All") params.set("genre", genre.toLowerCase());
      const res = await fetch(`/api/books?${params}`);
      return res.json();
    },
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epubFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("title", uploadForm.title || epubFile.name.replace(".epub", ""));
    fd.append("author", uploadForm.author || "Unknown");
    fd.append("genres", JSON.stringify(
      uploadForm.genres.split(",").map((g) => g.trim()).filter(Boolean)
    ));
    if (uploadForm.series) fd.append("series", uploadForm.series);
    if (uploadForm.description) fd.append("description", uploadForm.description);
    fd.append("epub", epubFile);

    await fetch("/api/books", { method: "POST", body: fd });
    setUploading(false);
    setShowUpload(false);
    setEpubFile(null);
    setUploadForm({ title: "", author: "", genres: "", series: "", description: "" });
    queryClient.invalidateQueries({ queryKey: ["books"] });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".epub")) {
      setEpubFile(file);
      setShowUpload(true);
    }
  }, []);

  return (
    <div className="flex h-screen bg-[#F3EFE9] overflow-hidden">
      <Sidebar />

      <main
        className="flex-1 overflow-y-auto p-6 lg:p-12"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-black">Library</h1>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                {books.length} {books.length === 1 ? "item" : "items"}
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:scale-105 transition-transform shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Search + Filter + View */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-4 py-2.5 bg-black/5 rounded-xl">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 text-sm outline-none bg-transparent text-black placeholder-gray-500 font-medium"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex gap-1 bg-black/5 rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                className={cn("p-2 rounded-lg transition-colors", view === "grid" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("p-2 rounded-lg transition-colors", view === "list" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Genre filter */}
          <div className="flex gap-2 overflow-x-auto scroll-hide pb-2 mb-8">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all tracking-wide",
                  genre === g
                    ? "bg-black text-white"
                    : "bg-black/5 text-gray-600 hover:bg-black/10"
                )}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Drop zone hint */}
          {books.length === 0 && !isLoading && (
            <div className="border-2 border-dashed border-[#D0CCC4] rounded-3xl p-16 text-center mb-8">
              <Upload className="w-12 h-12 text-[#D0CCC4] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#6B6B6B] mb-2">
                Drop an EPUB here to get started
              </h3>
              <p className="text-sm text-[#B0ABA4] mb-4">
                Or click &quot;Add Book&quot; to import your EPUB files
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-5 py-2.5 bg-[#E85D5D] text-white text-sm font-semibold rounded-xl hover:bg-[#D44B4B] transition-all"
              >
                Import EPUB
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[#E8E4DC] rounded-2xl h-[172px] mb-3" />
                  <div className="bg-[#E8E4DC] rounded h-3 mb-2" />
                  <div className="bg-[#E8E4DC] rounded h-2.5 w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Grid view */}
          {!isLoading && view === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={book.epubUrl ? `/reader/${book.id}` : "#"}
                  className="group block"
                >
                  <div className="relative w-full aspect-[2/3] rounded-sm overflow-hidden mb-4 shadow-[10px_10px_20px_rgba(0,0,0,0.1)] group-hover:shadow-[10px_10px_30px_rgba(0,0,0,0.2)] transition-all group-hover:-translate-y-1 duration-300">
                    {book.cover ? (
                      <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#E5E5EA] flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    {!book.epubUrl && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-black text-xs font-semibold px-2 py-1 rounded-lg">No EPUB</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-black line-clamp-2 leading-snug mb-1 transition-colors">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium truncate">{book.author}</p>
                </Link>
              ))}
            </div>
          )}

          {/* List view */}
          {!isLoading && view === "list" && (
            <div className="space-y-2">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={book.epubUrl ? `/reader/${book.id}` : "#"}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all group fade-in-up"
                >
                  <div className="relative w-14 h-20 rounded-xl overflow-hidden shrink-0 shadow-md">
                    {book.cover ? (
                      <Image src={book.cover} alt={book.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full bg-[#EDEAE4] flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-[#B0ABA4]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#E85D5D] transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#9E9A94] mb-2">{book.author}</p>
                    <div className="flex items-center gap-3 text-xs text-[#B0ABA4]">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {book.totalPages} pages
                      </span>
                      {book.genres?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {book.genres[0]}
                        </span>
                      )}
                    </div>
                  </div>
                  {!book.epubUrl && (
                    <span className="text-xs text-[#B0ABA4] bg-[#F5F3EF] px-2.5 py-1 rounded-lg shrink-0">
                      No EPUB
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Add Book</h2>
              <button
                onClick={() => { setShowUpload(false); setEpubFile(null); }}
                className="w-8 h-8 rounded-full bg-[#F5F3EF] hover:bg-[#EDEAE4] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              {/* EPUB drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors",
                  epubFile
                    ? "border-[#E85D5D] bg-[#FDF1F1]"
                    : "border-[#D0CCC4] hover:border-[#E85D5D] hover:bg-[#FDF9F9]"
                )}
              >
                <Upload className={cn("w-8 h-8 mx-auto mb-2", epubFile ? "text-[#E85D5D]" : "text-[#D0CCC4]")} />
                {epubFile ? (
                  <p className="text-sm font-medium text-[#E85D5D]">{epubFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-[#6B6B6B]">Drop EPUB here</p>
                    <p className="text-xs text-[#B0ABA4]">or click to browse</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".epub"
                  className="hidden"
                  onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
                />
              </div>

              <input
                type="text"
                placeholder="Title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F5F3EF] rounded-xl text-sm outline-none placeholder-[#B0ABA4] text-[#1A1A1A] focus:ring-2 focus:ring-[#E85D5D]/20"
              />
              <input
                type="text"
                placeholder="Author"
                value={uploadForm.author}
                onChange={(e) => setUploadForm({ ...uploadForm, author: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F5F3EF] rounded-xl text-sm outline-none placeholder-[#B0ABA4] text-[#1A1A1A] focus:ring-2 focus:ring-[#E85D5D]/20"
              />
              <input
                type="text"
                placeholder="Genres (comma separated)"
                value={uploadForm.genres}
                onChange={(e) => setUploadForm({ ...uploadForm, genres: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F5F3EF] rounded-xl text-sm outline-none placeholder-[#B0ABA4] text-[#1A1A1A] focus:ring-2 focus:ring-[#E85D5D]/20"
              />
              <input
                type="text"
                placeholder="Series (optional)"
                value={uploadForm.series}
                onChange={(e) => setUploadForm({ ...uploadForm, series: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#F5F3EF] rounded-xl text-sm outline-none placeholder-[#B0ABA4] text-[#1A1A1A] focus:ring-2 focus:ring-[#E85D5D]/20"
              />

              <button
                type="submit"
                disabled={!epubFile || uploading}
                className="w-full py-3 bg-[#E85D5D] text-white text-sm font-bold rounded-xl hover:bg-[#D44B4B] transition-all shadow-[0_4px_12px_rgba(232,93,93,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Add to Library"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
