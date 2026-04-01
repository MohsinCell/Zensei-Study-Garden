import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS, CATEGORY_LABELS, AchievementCategory } from "@/lib/achievements";

export async function GET() {
  try {
    const userId = await requireUserId();

    const unlocked = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    });

    const unlockedMap = new Map(
      unlocked.map((u) => [u.achievementId, u.unlockedAt.toISOString()])
    );

    const categories = Object.entries(CATEGORY_LABELS).map(([key, meta]) => {
      const achievements = ACHIEVEMENTS.filter((a) => a.category === key).map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        tier: a.tier,
        xpReward: a.xpReward,
        icon: a.icon,
        hidden: a.hidden || false,
        unlocked: unlockedMap.has(a.id),
        unlockedAt: unlockedMap.get(a.id) || null,
      }));

      const total = achievements.length;
      const earned = achievements.filter((a) => a.unlocked).length;

      return {
        key,
        ...meta,
        achievements,
        total,
        earned,
      };
    });

    return NextResponse.json({
      categories,
      totalAchievements: ACHIEVEMENTS.length,
      totalUnlocked: unlocked.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
