import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all annotations for a user/book
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const bookId = searchParams.get("bookId");

    if (!userId || !bookId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const annotations = await prisma.annotation.findMany({
      where: { userId, bookId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(annotations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch annotations" }, { status: 500 });
  }
}

// POST a new annotation
export async function POST(req: NextRequest) {
  try {
    const { userId, bookId, cfiRange, text, color } = await req.json();

    const annotation = await prisma.annotation.create({
      data: {
        userId,
        bookId,
        cfiRange,
        text,
        color: color || "yellow",
      },
    });

    return NextResponse.json(annotation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create annotation" }, { status: 500 });
  }
}

// DELETE an annotation
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    await prisma.annotation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete annotation" }, { status: 500 });
  }
}
