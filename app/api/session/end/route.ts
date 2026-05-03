import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, duration, userId, bookId } = await req.json();

    if (sessionId) {
      const session = await prisma.readingSession.update({
        where: { id: sessionId },
        data: { endedAt: new Date(), duration },
      });

      // Also update total time spent on book
      await prisma.readingProgress.upsert({
        where: { userId_bookId: { userId, bookId } },
        update: { timeSpent: { increment: duration } },
        create: { userId, bookId, timeSpent: duration },
      });

      return NextResponse.json({ ...session, date: session.date.toISOString() });
    }

    // Fallback: create completed session directly
    const session = await prisma.readingSession.create({
      data: {
        userId,
        bookId,
        duration,
        startedAt: new Date(Date.now() - duration * 1000),
        endedAt: new Date(),
      },
    });

    await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId, bookId } },
      update: { timeSpent: { increment: duration } },
      create: { userId, bookId, timeSpent: duration },
    });

    return NextResponse.json({ ...session, date: session.date.toISOString() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
