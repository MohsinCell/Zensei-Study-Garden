import { NextResponse } from "next/server";
import { requireDev } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireDev();

    const [users, topicCount, explanationCount, achievementCount] =
      await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
            xp: true,
            xpLevel: true,
            currentStreak: true,
            totalTopics: true,
            totalExplanations: true,
            lastActiveDate: true,
            _count: { select: { topics: true, achievements: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.topic.count(),
        prisma.explanation.count(),
        prisma.userAchievement.count(),
      ]);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
      .toISOString()
      .slice(0, 10);

    const activeToday = users.filter((u) => u.lastActiveDate === today).length;
    const activeThisWeek = users.filter(
      (u) => u.lastActiveDate >= weekAgo
    ).length;

    return NextResponse.json({
      metrics: {
        totalUsers: users.length,
        totalTopics: topicCount,
        totalExplanations: explanationCount,
        totalAchievements: achievementCount,
        activeToday,
        activeThisWeek,
      },
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        createdAt: u.createdAt.toISOString(),
        xp: u.xp,
        level: u.xpLevel,
        streak: u.currentStreak,
        topics: u._count.topics,
        explanations: u.totalExplanations,
        achievements: u._count.achievements,
        lastActive: u.lastActiveDate,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Unauthorized" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
