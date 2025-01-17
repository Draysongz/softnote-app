import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: userId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        photoUrl: true,
        level: true,
        coins: true,
        taps: true,
        maxTaps: true,
        refillRate: true,
        lastRefillTime: true,
        slots: true,
        referralCount: true,
        referredBy: true,
        freeSpins: true,
        multitap: true,
        tapLimitBoost: true,
        tappingGuruUses: true,
        profitPerHour: true,
        lastEarningsUpdate: true,
        lastCheckIn: true,
        checkInStreak: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate and update energy if needed
    const now = new Date();
    const lastRefill = new Date(user.lastRefillTime);
    const elapsedSeconds = (now.getTime() - lastRefill.getTime()) / 1000;
    const energyToAdd = Math.floor(elapsedSeconds * user.refillRate);

    if (energyToAdd > 0 && user.taps < user.maxTaps) {
      const updatedTaps = Math.min(user.maxTaps, user.taps + energyToAdd);
      
      await prisma.user.update({
        where: { telegramId: userId },
        data: {
          taps: updatedTaps,
          lastRefillTime: now,
        },
      });

      user.taps = updatedTaps;
      user.lastRefillTime = now;
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error("Error in getuser route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 