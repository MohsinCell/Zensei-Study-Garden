import { prisma } from "./prisma";
import { ACHIEVEMENTS, UserStats, Achievement } from "./achievements";

// ─── XP Awards ───

export type XPAction =
  | "initial"
  | "deeper"
  | "followup"
  | "example"
  | "analogy"
  | "simplified"
  | "rate"
  | "rate_perfect";

const BASE_XP: Record<XPAction, number> = {
  initial: 20,
  deeper: 15,
  followup: 12,
  example: 10,
  analogy: 10,
  simplified: 8,
  rate: 5,
  rate_perfect: 10,
};

// ─── Streak Multiplier ───

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7) return 1.5;
  if (streak >= 5) return 1.3;
  if (streak >= 3) return 1.2;
  if (streak >= 2) return 1.1;
  return 1.0;
}

// ─── Level Curve ───
// XP to go from level N to N+1 = 75 + (N * 25)
// Cumulative XP for level N = sum_{i=1}^{N-1} (75 + i*25)

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // Sum: (N-1)*75 + 25*(N-1)*N/2
  const n = level - 1;
  return n * 75 + Math.floor((25 * n * (n + 1)) / 2);
}

export function xpToNextLevel(currentLevel: number): number {
  return 75 + currentLevel * 25;
}

export function levelFromXP(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

// ─── Rank System ───

export interface Rank {
  name: string;
  minLevel: number;
  icon: string;
  color: string;
}

export const RANKS: Rank[] = [
  { name: "Seed", minLevel: 1, icon: "rank-seed", color: "text-text-muted" },
  { name: "Sprout", minLevel: 5, icon: "rank-sprout", color: "text-accent" },
  { name: "Seedling", minLevel: 10, icon: "rank-seedling", color: "text-accent" },
  { name: "Young Plant", minLevel: 15, icon: "rank-young-plant", color: "text-accent" },
  { name: "Leafy Plant", minLevel: 20, icon: "rank-leafy-plant", color: "text-gold" },
  { name: "Budding Plant", minLevel: 30, icon: "rank-budding-plant", color: "text-gold" },
  { name: "Sapling", minLevel: 40, icon: "rank-sapling", color: "text-gold" },
  { name: "Young Tree", minLevel: 50, icon: "rank-young-tree", color: "text-ember" },
  { name: "Tree", minLevel: 75, icon: "rank-tree", color: "text-ember" },
  { name: "Elder Tree", minLevel: 100, icon: "rank-elder-tree", color: "text-ember" },
];

export function getRank(level: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) rank = r;
  }
  return rank;
}

// ─── Timezone-aware Date Helpers ───

function getDateInTimezone(timezone: string): Date {
  // Get current time formatted in the user's timezone, then parse it
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = formatter.format(new Date()); // Returns "YYYY-MM-DD"
  return new Date(dateStr + "T00:00:00Z");
}

function todayStrInTimezone(timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date()); // Returns "YYYY-MM-DD"
}

function yesterdayStrInTimezone(timezone: string): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(yesterday);
}

function todayStartInTimezone(timezone: string): Date {
  // Get today's date in user's timezone, then convert to UTC for DB query
  const todayStr = todayStrInTimezone(timezone);
  // Parse as midnight in the user's timezone
  const localMidnight = new Date(todayStr + "T00:00:00");
  // Get the offset for this timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(localMidnight);
  const offsetPart = parts.find(p => p.type === "timeZoneName")?.value || "+00:00";

  // Parse offset like "GMT+5:30" or "GMT-8"
  const match = offsetPart.match(/GMT([+-]?)(\d{1,2})(?::(\d{2}))?/);
  if (match) {
    const sign = match[1] === "-" ? 1 : -1; // Reverse for UTC conversion
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3] || "0", 10);
    const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000;
    return new Date(localMidnight.getTime() + offsetMs);
  }

  // Fallback to UTC
  return new Date(todayStr + "T00:00:00Z");
}

// Legacy functions for backward compatibility (default to UTC)
function todayStr(): string {
  return todayStrInTimezone("UTC");
}

function yesterdayStr(): string {
  return yesterdayStrInTimezone("UTC");
}

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  streakUpdated: boolean;
}

function updateStreak(
  lastActiveDate: string,
  currentStreak: number,
  longestStreak: number,
  timezone: string = "UTC"
): StreakResult {
  const today = todayStrInTimezone(timezone);

  if (lastActiveDate === today) {
    return { currentStreak, longestStreak, streakUpdated: false };
  }

  let newStreak: number;
  if (lastActiveDate === yesterdayStrInTimezone(timezone)) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 1;
  }

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    streakUpdated: true,
  };
}

// ─── Stats Builder ───

export async function getUserStats(userId: string, timezone: string = "UTC"): Promise<UserStats> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const [
    topicCount,
    explanationCounts,
    ratingStats,
    tagData,
    topicsToday,
  ] = await Promise.all([
    prisma.topic.count({ where: { userId } }),

    // Count explanations by type
    prisma.explanation.groupBy({
      by: ["type"],
      where: { topic: { userId } },
      _count: true,
    }),

    // Rating stats
    prisma.topic.findMany({
      where: { userId, rating: { not: null } },
      select: { rating: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),

    // Tag data for category counts
    prisma.topic.findMany({
      where: { userId },
      select: { tags: true },
    }),

    // Topics created today (in user's timezone)
    prisma.topic.count({
      where: {
        userId,
        createdAt: { gte: todayStartInTimezone(timezone) },
      },
    }),
  ]);

  // Depth & purpose counts
  const depthCounts = await prisma.explanation.groupBy({
    by: ["depthPreference"],
    where: { topic: { userId }, type: "initial" },
    _count: true,
  });

  const purposeCounts = await prisma.explanation.groupBy({
    by: ["purposeIntent"],
    where: { topic: { userId }, type: "initial" },
    _count: true,
  });

  // Build type counts
  const typeMap: Record<string, number> = {};
  for (const row of explanationCounts) {
    typeMap[row.type] = row._count;
  }

  // Build tag counts
  const tagCounts: Record<string, number> = {};
  const allTags = new Set<string>();
  for (const t of tagData) {
    try {
      const tags: string[] = JSON.parse(t.tags);
      for (const tag of tags) {
        const lower = tag.toLowerCase();
        tagCounts[lower] = (tagCounts[lower] || 0) + 1;
        allTags.add(lower);
      }
    } catch {}
  }

  // Rating analysis
  const totalRatings = ratingStats.length;
  let ratings5 = 0, ratings4Plus = 0, ratings1 = 0;
  for (const r of ratingStats) {
    if (r.rating === 5) ratings5++;
    if (r.rating !== null && r.rating >= 4) ratings4Plus++;
    if (r.rating === 1) ratings1++;
  }

  // Consecutive high ratings (from most recent)
  let consecutiveHighRatings = 0;
  for (const r of ratingStats) {
    if (r.rating !== null && r.rating >= 4) consecutiveHighRatings++;
    else break;
  }

  // Depth/purpose counts
  const depthMap: Record<string, number> = {};
  for (const row of depthCounts) depthMap[row.depthPreference] = row._count;
  const purposeMap: Record<string, number> = {};
  for (const row of purposeCounts) purposeMap[row.purposeIntent] = row._count;

  // Action types used
  const actionTypes = ["deeper", "simplified", "example", "analogy"];
  let actionTypesUsed = 0;
  for (const at of actionTypes) {
    if ((typeMap[at] || 0) > 0) actionTypesUsed++;
  }

  const totalActions =
    (typeMap["deeper"] || 0) +
    (typeMap["simplified"] || 0) +
    (typeMap["example"] || 0) +
    (typeMap["analogy"] || 0);

  const now = new Date();

  return {
    totalTopics: topicCount,
    totalExplanations: Object.values(typeMap).reduce((a, b) => a + b, 0),
    deeperCount: typeMap["deeper"] || 0,
    followupCount: typeMap["followup"] || 0,
    exampleCount: typeMap["example"] || 0,
    analogyCount: typeMap["analogy"] || 0,
    simplifiedCount: typeMap["simplified"] || 0,
    totalRatings,
    ratings5,
    ratings4Plus,
    ratings1,
    briefCount: depthMap["brief"] || 0,
    detailedCount: depthMap["detailed"] || 0,
    curiosityCount: purposeMap["curiosity"] || 0,
    examCount: purposeMap["exam"] || 0,
    xp: user.xp,
    xpLevel: user.xpLevel,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    tagCounts,
    uniqueCategories: allTags.size,
    actionTypesUsed,
    totalActions,
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    topicsToday,
    xpToday: 0, // Will be calculated separately if needed
    consecutiveHighRatings,
  };
}

// ─── Core Progression Function ───

export interface ProgressionResult {
  xpAwarded: number;
  xpBefore: number;
  xpAfter: number;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
  streakBefore: number;
  streakAfter: number;
  streakMultiplier: number;
  newAchievements: Achievement[];
  rank: Rank;
}

export async function awardXP(
  userId: string,
  action: XPAction
): Promise<ProgressionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { achievements: { select: { achievementId: true } } },
  });
  if (!user) throw new Error("User not found");

  const timezone = user.timezone || "UTC";

  // Update streak (using user's timezone)
  const streakResult = updateStreak(
    user.lastActiveDate,
    user.currentStreak,
    user.longestStreak,
    timezone
  );

  // Calculate XP with streak multiplier
  const multiplier = getStreakMultiplier(streakResult.currentStreak);
  const baseXP = BASE_XP[action];
  const xpAwarded = Math.floor(baseXP * multiplier);

  const xpBefore = user.xp;
  const xpAfter = xpBefore + xpAwarded;
  const levelBefore = user.xpLevel;
  const levelAfter = levelFromXP(xpAfter);

  // Update counters
  const isNewTopic = action === "initial";
  const isExplanation = ["initial", "deeper", "followup", "example", "analogy", "simplified"].includes(action);

  // Update user (store date in user's timezone)
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: xpAfter,
      xpLevel: levelAfter,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      lastActiveDate: todayStrInTimezone(timezone),
      ...(isNewTopic ? { totalTopics: { increment: 1 } } : {}),
      ...(isExplanation ? { totalExplanations: { increment: 1 } } : {}),
    },
  });

  // Check for new achievements (using user's timezone)
  const unlockedIds = new Set(user.achievements.map((a) => a.achievementId));
  const stats = await getUserStats(userId, timezone);
  // Also set xpToday approximation
  stats.xpToday = xpAwarded; // Simplified - real tracking would need daily aggregation

  const newAchievements: Achievement[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (achievement.check(stats, unlockedIds)) {
      newAchievements.push(achievement);
    }
  }

  // Recursively check for meta achievements that may unlock due to new achievements
  let changed = true;
  while (changed) {
    changed = false;
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue;
      if (newAchievements.some((na) => na.id === achievement.id)) continue;
      if (achievement.check(stats, new Set([...unlockedIds, ...newAchievements.map((a) => a.id)]))) {
        newAchievements.push(achievement);
        changed = true;
      }
    }
  }

  // Save new achievements and add bonus XP
  if (newAchievements.length > 0) {
    for (const a of newAchievements) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: a.id } },
        create: { userId, achievementId: a.id },
        update: {},
      });
    }

    // Add achievement bonus XP
    const bonusXP = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
    if (bonusXP > 0) {
      const finalXP = xpAfter + bonusXP;
      const finalLevel = levelFromXP(finalXP);
      await prisma.user.update({
        where: { id: userId },
        data: { xp: finalXP, xpLevel: finalLevel },
      });

      return {
        xpAwarded: xpAwarded + bonusXP,
        xpBefore,
        xpAfter: finalXP,
        levelBefore,
        levelAfter: finalLevel,
        leveledUp: finalLevel > levelBefore,
        streakBefore: user.currentStreak,
        streakAfter: streakResult.currentStreak,
        streakMultiplier: multiplier,
        newAchievements,
        rank: getRank(finalLevel),
      };
    }
  }

  return {
    xpAwarded,
    xpBefore,
    xpAfter,
    levelBefore,
    levelAfter,
    leveledUp: levelAfter > levelBefore,
    streakBefore: user.currentStreak,
    streakAfter: streakResult.currentStreak,
    streakMultiplier: multiplier,
    newAchievements,
    rank: getRank(levelAfter),
  };
}

// ─── Get Full Progression State ───

export interface ProgressionState {
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number; // 0-1 fraction within current level
  rank: Rank;
  nextRank: Rank | null;
  currentStreak: number;
  longestStreak: number;
  streakMultiplier: number;
  totalTopics: number;
  totalExplanations: number;
  achievementCount: number;
  totalAchievements: number;
}

export async function getProgression(userId: string): Promise<ProgressionState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { achievements: true } } },
  });
  if (!user) throw new Error("User not found");

  const timezone = user.timezone || "UTC";

  // Ensure streak is current (using user's timezone)
  const streakResult = updateStreak(
    user.lastActiveDate,
    user.currentStreak,
    user.longestStreak,
    timezone
  );

  const level = user.xpLevel;
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  const xpInLevel = user.xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;

  const rank = getRank(level);
  const nextRankIndex = RANKS.findIndex((r) => r.name === rank.name) + 1;
  const nextRank = nextRankIndex < RANKS.length ? RANKS[nextRankIndex] : null;

  return {
    xp: user.xp,
    level,
    xpForCurrentLevel: currentLevelXP,
    xpForNextLevel: nextLevelXP,
    xpProgress: xpNeeded > 0 ? Math.min(1, xpInLevel / xpNeeded) : 1,
    rank,
    nextRank,
    currentStreak: streakResult.currentStreak,
    longestStreak: streakResult.longestStreak,
    streakMultiplier: getStreakMultiplier(streakResult.currentStreak),
    totalTopics: user.totalTopics,
    totalExplanations: user.totalExplanations,
    achievementCount: user._count.achievements,
    totalAchievements: ACHIEVEMENTS.length,
  };
}
