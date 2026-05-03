import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { HeaderGreeting } from "@/components/dashboard/HeaderGreeting";
import { FeaturedBook } from "@/components/dashboard/FeaturedBook";
import { BookCarousel } from "@/components/dashboard/BookCarousel";
import { SeriesCollection } from "@/components/dashboard/SeriesCollection";
import { RightPanel } from "@/components/dashboard/RightPanel";
import type { Book, ReadingProgress, ReadingSession } from "@/types";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function getData(userId: string, userName: string, imageUrl?: string) {
  // Ensure guest user exists and fetch
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { name: userName, avatar: imageUrl },
    create: { id: userId, name: userName, avatar: imageUrl },
  });

  const [books, progress, sessions] = await Promise.all([
    prisma.book.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.readingProgress.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.readingSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    }),
  ]);

  return { user, books, progress, sessions };
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const userName = clerkUser?.firstName || clerkUser?.username || "Reader";
  const imageUrl = clerkUser?.imageUrl;

  const { user, books, progress, sessions } = await getData(userId, userName, imageUrl);

  // Serialize for client components
  const serializedBooks: Book[] = books.map((b: (typeof books)[number]) => ({
    ...b,
    genres: JSON.parse(b.genres || "[]"),
    createdAt: b.createdAt.toISOString(),
  }));

  const serializedProgress: ReadingProgress[] = progress.map((p: (typeof progress)[number]) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
    book: p.book
      ? {
          ...p.book,
          genres: JSON.parse(p.book.genres || "[]"),
          createdAt: p.book.createdAt.toISOString(),
        }
      : undefined,
  }));

  const serializedSessions: ReadingSession[] = sessions.map((s: (typeof sessions)[number]) => ({
    ...s,
    date: s.date.toISOString(),
    startedAt: s.startedAt?.toISOString() ?? null,
    endedAt: s.endedAt?.toISOString() ?? null,
  }));

  const currentBook = serializedProgress.find((p) => p.progress > 0 && p.progress < 1) ?? serializedProgress[0] ?? null;

  return (
    <div className="flex h-screen bg-[#F3EFE9] overflow-hidden">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto scroll-hide px-4 md:px-8 lg:px-12 py-6 md:py-10">
        <div className="max-w-6xl mx-auto space-y-12 md:space-y-16">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
            <HeaderGreeting userName={userName} currentBook={currentBook} />
            <div className="w-full md:w-[300px]">
              <GlobalSearch />
            </div>
          </div>

          {/* Hero Section */}
          <FeaturedBook currentBook={currentBook} />

          {/* Carousels */}
          <div className="space-y-16">
            {serializedBooks.length > 0 && (
              <BookCarousel
                title="Popular Now"
                books={serializedBooks.slice(0, 8)}
              />
            )}

            {serializedBooks.length > 0 && (
              <BookCarousel
                title="Recommended for You"
                books={serializedBooks.slice(8, 16)}
              />
            )}
          </div>

          {/* Collections */}
          {serializedBooks.length > 0 && (
            <SeriesCollection books={serializedBooks} />
          )}
          
          {/* Mobile Right Panel Stacked */}
          <div className="xl:hidden w-full mt-10">
            <RightPanel currentBook={currentBook} sessions={serializedSessions} user={user} isMobile={true} recentBooks={serializedBooks.slice(0, 3)} />
          </div>

          {/* Bottom Spacing */}
          <div className="h-20" />
        </div>
      </main>

      {/* 3. Right Panel Desktop */}
      <div className="hidden xl:block shrink-0">
        <RightPanel currentBook={currentBook} sessions={serializedSessions} user={user} recentBooks={serializedBooks.slice(0, 3)} />
      </div>
    </div>
  );
}
