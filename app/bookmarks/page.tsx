import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";
import { Bookmark as BookmarkIcon, Highlighter } from "lucide-react";
import Image from "next/image";

async function getBookmarks(userId: string) {
  return await prisma.annotation.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });
}

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const annotations = await getBookmarks(userId);

  const bookmarks = annotations.filter((a) => a.color === "bookmark");
  const highlights = annotations.filter((a) => a.color !== "bookmark");

  return (
    <div className="flex h-screen bg-[#F3EFE9] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#1D1D1F] mb-2">Bookmarks & Highlights</h1>
            <p className="text-[#8C7A6B]">Revisit your favorite moments and saved pages.</p>
          </div>

          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[#1D1D1F]">
              <BookmarkIcon className="w-5 h-5" /> Saved Pages
            </h2>
            {bookmarks.length === 0 ? (
              <div className="p-8 text-center bg-white/50 border border-black/5 rounded-2xl">
                <p className="text-gray-500">No bookmarks saved yet. Click the bookmark icon in the reader to save a page.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookmarks.map((b) => (
                  <Link href={`/reader/${b.bookId}`} key={b.id}>
                    <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
                      <div className="relative w-12 h-16 rounded overflow-hidden shrink-0 bg-gray-200">
                         {b.book.cover && <Image src={b.book.cover} alt="Cover" fill className="object-cover" sizes="48px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#1D1D1F] truncate">{b.book.title}</h3>
                        <p className="text-sm text-gray-500 italic line-clamp-2 mt-1">"{b.text}"</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[#1D1D1F]">
              <Highlighter className="w-5 h-5" /> Highlights
            </h2>
            {highlights.length === 0 ? (
              <div className="p-8 text-center bg-white/50 border border-black/5 rounded-2xl">
                <p className="text-gray-500">No highlights saved yet. Select text in the reader to highlight it.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {highlights.map((h) => (
                  <Link href={`/reader/${h.bookId}`} key={h.id}>
                    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: h.color }} />
                      <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{h.book.title}</h3>
                      <p className="text-gray-800 font-serif leading-relaxed line-clamp-3">"{h.text}"</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
