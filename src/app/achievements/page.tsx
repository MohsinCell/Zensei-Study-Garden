"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Icon from "@/components/ui/Icon";
import Loader from "@/components/ui/Loader";

interface AchievementData {
  id: string;
  name: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "legendary";
  xpReward: number;
  icon: string;
  hidden: boolean;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface CategoryData {
  key: string;
  label: string;
  icon: string;
  achievements: AchievementData[];
  total: number;
  earned: number;
}

interface Progression {
  xp: number;
  level: number;
  xpProgress: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  rank: { name: string; icon: string };
  nextRank: { name: string; minLevel: number; icon: string } | null;
  currentStreak: number;
  longestStreak: number;
  streakMultiplier: number;
  totalTopics: number;
  totalExplanations: number;
  achievementCount: number;
  totalAchievements: number;
}

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  bronze: {
    bg: "bg-amber-900/12",
    border: "border-amber-700/25",
    text: "text-amber-500",
    glow: "",
  },
  silver: {
    bg: "bg-gray-600/12",
    border: "border-gray-500/25",
    text: "text-gray-300",
    glow: "",
  },
  gold: {
    bg: "bg-yellow-900/12",
    border: "border-yellow-600/25",
    text: "text-yellow-400",
    glow: "shadow-[0_0_10px_rgba(234,179,8,0.08)]",
  },
  platinum: {
    bg: "bg-cyan-900/12",
    border: "border-cyan-500/25",
    text: "text-cyan-300",
    glow: "shadow-[0_0_10px_rgba(103,232,249,0.08)]",
  },
  legendary: {
    bg: "bg-purple-900/12",
    border: "border-purple-500/25",
    text: "text-purple-400",
    glow: "shadow-[0_0_15px_rgba(192,132,252,0.12)]",
  },
};

export default function AchievementsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [prog, setProg] = useState<Progression | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/achievements").then((r) => r.json()),
        fetch("/api/progression").then((r) => r.json()),
      ])
        .then(([achData, progData]) => {
          setCategories(achData.categories ?? []);
          setProg(progData);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const totalUnlocked = categories.reduce((sum, c) => sum + c.earned, 0);
  const totalAll = categories.reduce((sum, c) => sum + c.total, 0);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <PageShell>
      <PageHeader
        badge="trophy case"
        badgeIcon="trophy"
        badgeColor="gold"
        title="Your Achievements"
        subtitle={`${totalUnlocked} of ${totalAll} earned. Keep learning to collect more.`}
      />

      {prog && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-8">
          <StatCard iconName={prog.rank.icon} label="Rank" value={prog.rank.name} sub={`Level ${prog.level}`} />
          <StatCard iconName="bolt" label="Total XP" value={prog.xp.toLocaleString()} sub={`${Math.round(prog.xpProgress * 100)}% to next`} />
          <StatCard iconName="flame" label="Streak" value={`${prog.currentStreak}d`} sub={prog.streakMultiplier > 1 ? `${prog.streakMultiplier}x bonus` : "Keep it up"} />
          <StatCard iconName="medal" label="Badges" value={`${totalUnlocked}`} sub={`of ${totalAll} total`} />
        </div>
      )}

      {prog && (
        <div className="mb-5 sm:mb-8 surface-card p-3 sm:p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold">Level {prog.level}</span>
            <span className="text-[12px] text-text-dim font-medium">
              {prog.xp - prog.xpForCurrentLevel} / {prog.xpForNextLevel - prog.xpForCurrentLevel} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-bg-inset overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-gold to-ember transition-all duration-700"
              style={{ width: `${Math.max(2, prog.xpProgress * 100)}%` }}
            />
          </div>
          {prog.nextRank && (
            <p className="text-text-dim mt-2.5 font-pixel uppercase tracking-wider flex items-center gap-1.5">
              <Icon name={prog.nextRank.icon} className="w-3.5 h-3.5" />
              Next rank: {prog.nextRank.name} at level {prog.nextRank.minLevel}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const isExpanded = expandedCat === cat.key;
            const progress = cat.total > 0 ? (cat.earned / cat.total) * 100 : 0;

            return (
              <div key={cat.key} className="surface-card overflow-hidden rounded-xl">

                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.key)}
                  className="focus-ring w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg-hover transition-colors duration-150 rounded-xl"
                  aria-expanded={isExpanded}
                >
                  <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
                    <Icon name={cat.icon} className="w-4.5 h-4.5 text-text-secondary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{cat.label}</span>
                      <span className="font-pixel text-text-dim">
                        {cat.earned}/{cat.total}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-bg-inset overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: `${Math.max(1, progress)}%` }}
                      />
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-text-dim transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 stagger-in">
                    {cat.achievements.map((ach) => {
                      const style = TIER_STYLES[ach.tier];
                      const isHidden = ach.hidden && !ach.unlocked;

                      return (
                        <div
                          key={ach.id}
                          className={`relative rounded-xl border p-3.5 transition-all duration-150 ${
                            ach.unlocked
                              ? `${style.bg} ${style.border} ${style.glow}`
                              : "bg-bg-surface/40 border-border/40 opacity-55"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              ach.unlocked ? "bg-white/5" : "bg-bg-elevated"
                            }`}>
                              {isHidden ? (
                                <Icon name="lock" className="w-4 h-4 text-text-dim" />
                              ) : (
                                <Icon name={ach.icon} className={`w-4.5 h-4.5 ${ach.unlocked ? style.text : "text-text-dim grayscale"}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-[13px] font-semibold ${ach.unlocked ? "text-text" : "text-text-dim"}`}>
                                  {isHidden ? "???" : ach.name}
                                </span>
                                <span className={`font-pixel uppercase tracking-wider ${style.text}`}>
                                  {ach.tier}
                                </span>
                              </div>
                              <p className={`text-[12px] mt-0.5 leading-relaxed ${ach.unlocked ? "text-text-muted" : "text-text-dim"}`}>
                                {isHidden ? "Keep learning to discover this" : ach.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="font-pixel text-accent">+{ach.xpReward} XP</span>
                                {ach.unlocked && ach.unlockedAt && (
                                  <span className="text-[10px] text-text-dim">
                                    {new Date(ach.unlockedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {ach.unlocked && (
                              <div className="shrink-0">
                                <Icon name="check-badge" className="w-5 h-5 text-accent" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
