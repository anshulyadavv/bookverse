import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, dailyGoalMins } = await req.json();

    if (!userId || dailyGoalMins === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyGoalMins: parseInt(dailyGoalMins),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
