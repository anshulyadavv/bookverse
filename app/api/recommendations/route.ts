import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBooksBySubject, getCoverUrl } from "@/lib/openLibrary";

type OLBook = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "guest";

  try {
    // Get user's most-read genres from their progress
    const progress = await prisma.readingProgress.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { timeSpent: "desc" },
      take: 10,
    });

    const genreCounts: Record<string, number> = {};
    for (const p of progress) {
      const genres: string[] = JSON.parse(p.book.genres || "[]");
      for (const g of genres) {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      }
    }

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);

    const subjects = topGenres.length > 0 ? topGenres : ["fantasy", "science fiction", "mystery"];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    const olBooks = await getBooksBySubject(subject, 12);
    const recommendations = (olBooks as OLBook[])
      .filter((b: OLBook) => b.cover_i)
      .map((b: OLBook) => ({
        id: b.key.replace("/works/", "ol_"),
        title: b.title,
        author: b.author_name?.[0] ?? "Unknown",
        cover: b.cover_i ? getCoverUrl(b.cover_i, "M") : null,
        genres: [subject],
        totalPages: 300,
        source: "openlibrary",
      }));

    return NextResponse.json({ subject, recommendations });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ subject: "fantasy", recommendations: [] });
  }
}
