import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...book,
      genres: JSON.parse(book.genres || "[]"),
      createdAt: book.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.readingProgress.deleteMany({ where: { bookId: id } });
    await prisma.readingSession.deleteMany({ where: { bookId: id } });
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
