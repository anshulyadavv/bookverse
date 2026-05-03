import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  try {
    const progress = await prisma.readingProgress.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { updatedAt: "desc" },
    });

    const result = progress.map((p: (typeof progress)[number]) => ({
      ...p,
      updatedAt: p.updatedAt.toISOString(),
      book: p.book
        ? {
            ...p.book,
            genres: JSON.parse(p.book.genres || "[]"),
            createdAt: p.book.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
