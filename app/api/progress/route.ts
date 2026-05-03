import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, bookId, progress, lastCfi, lastExcerpt, currentPage, totalPages, timeSpentDelta } = body;

    const existing = await prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    const record = await prisma.readingProgress.upsert({
      where: { userId_bookId: { userId, bookId } },
      update: {
        progress: progress ?? existing?.progress,
        lastCfi: lastCfi ?? existing?.lastCfi,
        lastExcerpt: lastExcerpt ?? existing?.lastExcerpt,
        currentPage: currentPage ?? existing?.currentPage,
        totalPages: totalPages ?? existing?.totalPages,
        timeSpent: (existing?.timeSpent ?? 0) + (timeSpentDelta ?? 0),
      },
      create: {
        userId,
        bookId,
        progress: progress ?? 0,
        lastCfi,
        lastExcerpt,
        currentPage: currentPage ?? 0,
        totalPages: totalPages ?? 300,
        timeSpent: timeSpentDelta ?? 0,
      },
    });

    if (totalPages && totalPages > 0) {
      await prisma.book.update({
        where: { id: bookId },
        data: { totalPages },
      });
    }

    // Update or create ReadingSession for today
    if (timeSpentDelta && timeSpentDelta > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const existingSession = await prisma.readingSession.findFirst({
        where: {
          userId,
          bookId,
          date: {
            gte: today,
          },
        },
      });

      if (existingSession) {
        await prisma.readingSession.update({
          where: { id: existingSession.id },
          data: {
            duration: existingSession.duration + timeSpentDelta, // Storing in seconds to prevent zero-floor bug
          },
        });
      } else {
        await prisma.readingSession.create({
          data: {
            userId,
            bookId,
            date: new Date(),
            duration: timeSpentDelta, // Storing in seconds
          },
        });
      }
    }

    return NextResponse.json({
      ...record,
      updatedAt: record.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
