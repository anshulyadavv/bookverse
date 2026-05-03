import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, bookId } = await req.json();
    const session = await prisma.readingSession.create({
      data: { userId, bookId, startedAt: new Date() },
    });
    return NextResponse.json({ ...session, date: session.date.toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
