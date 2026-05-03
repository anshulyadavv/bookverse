import { Sidebar } from "@/components/layout/Sidebar";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, FastForward, Library } from "lucide-react";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import type { Book } from "@/types";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [books, progress, sessions] = await Promise.all([
    prisma.book.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.readingProgress.findMany({ where: { userId } }),
    prisma.readingSession.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    }),
  ]);

  // Aggregate Metrics
  const totalSeconds = sessions.reduce((acc: number, s: (typeof sessions)[number]) => acc + s.duration, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  
  const totalPagesRead = progress.reduce((acc: number, p: (typeof progress)[number]) => acc + p.currentPage, 0);
  const pagesPerMin = totalMinutes > 0 ? (totalPagesRead / totalMinutes).toFixed(1) : "0.0";

  // Categorize Books
  const tbr: Book[] = [];
  const reading: (Book & { progressPct: number, timeSpent: number })[] = [];
  const completed: Book[] = [];

  books.forEach((book: (typeof books)[number]) => {
    const serializedBook: Book = {
      ...book,
      genres: JSON.parse(book.genres || "[]"),
      createdAt: book.createdAt.toISOString(),
    };
    const prog = progress.find((p: (typeof progress)[number]) => p.bookId === book.id);
    if (!prog || prog.progress === 0) {
      tbr.push(serializedBook);
    } else if (prog.progress > 0 && prog.progress < 1) {
      reading.push({ ...serializedBook, progressPct: prog.progress, timeSpent: prog.timeSpent });
    } else {
      completed.push(serializedBook);
    }
  });


  // Chart Data (Last 14 Days)
  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const daySeconds = sessions
      .filter((s: (typeof sessions)[number]) => new Date(s.date) >= d && new Date(s.date) < nextD)
      .reduce((total: number, s: (typeof sessions)[number]) => total + s.duration, 0);

    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mins: Math.floor(daySeconds / 60),
    };
  });

  const StatCard = ({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle: string }) => (
    <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform">
      <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-3xl font-black text-[#1D1D1F] mb-1">{value}</h3>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-[10px] text-gray-400 mt-2">{subtitle}</p>
    </div>
  );

  const BookList = ({ title, items, emptyText }: { title: string, items: any[], emptyText: string }) => (
    <div className="mt-12">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-[#1D1D1F] px-1">
        {title} <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <div className="p-8 text-center bg-white/50 border border-black/5 rounded-2xl">
          <p className="text-gray-500 text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 scroll-hide snap-x px-1">
          {items.map((b) => (
            <Link href={`/reader/${b.id}`} key={b.id} className="w-32 shrink-0 snap-start group relative">
              <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-sm overflow-hidden relative mb-3 group-hover:shadow-md transition-all">
                {b.cover ? (
                  <Image src={b.cover} alt={b.title} fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="w-full h-full bg-[#E5D8C5] flex flex-col items-center justify-center p-3 text-center">
                    <p className="font-serif font-bold text-[#5C4033] text-xs line-clamp-3 leading-tight">{b.title}</p>
                  </div>
                )}
                {b.progressPct !== undefined && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div className="h-full bg-green-500" style={{ width: `${b.progressPct * 100}%` }} />
                  </div>
                )}
              </div>
              <h3 className="text-xs font-bold text-[#1D1D1F] truncate group-hover:text-blue-500 transition-colors">{b.title}</h3>
              <p className="text-[10px] text-gray-500 truncate">{b.author}</p>
              {b.timeSpent !== undefined && (
                <p className="text-[9px] text-gray-400 font-bold mt-1 tracking-wider uppercase">
                  {Math.floor(b.timeSpent / 60)} mins read
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F3EFE9] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-12 scroll-hide">
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-[#1D1D1F] mb-2">Reading Analytics</h1>
            <p className="text-[#8C7A6B]">Track your reading habits, speed, and library progress.</p>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Time Spent" 
              value={totalMinutes > 60 ? `${(totalMinutes / 60).toFixed(1)}h` : `${totalMinutes}m`} 
              icon={<Clock size={24} />} 
              subtitle="Total reading time"
            />
            <StatCard 
              title="Books Finished" 
              value={completed.length} 
              icon={<CheckCircle2 size={24} />} 
              subtitle="Completed so far"
            />
            <StatCard 
              title="Pages Read" 
              value={totalPagesRead} 
              icon={<BookOpen size={24} />} 
              subtitle="Across all books"
            />
            <StatCard 
              title="Speed" 
              value={pagesPerMin} 
              icon={<FastForward size={24} />} 
              subtitle="Pages per minute"
            />
          </div>

          {/* Activity Graph */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50 mb-12">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Daily Consistency (Last 14 Days)</h2>
            </div>
            <ActivityChart data={chartData} />
          </div>

          {/* Library Breakdown */}
          <div className="space-y-4">
            <BookList 
              title="Currently Reading" 
              items={reading} 
              emptyText="You aren't reading any books right now. Pick one from your library to start!"
            />
            <BookList 
              title="Up Next (TBR)" 
              items={tbr} 
              emptyText="Your TBR is empty. Add some new books to your library!"
            />
            <BookList 
              title="Completed" 
              items={completed} 
              emptyText="You haven't finished any books yet. Keep reading!"
            />
          </div>

          <div className="h-20" />
        </div>
      </main>
    </div>
  );
}
