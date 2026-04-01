"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Icon from "@/components/ui/Icon";

interface Metrics {
  totalUsers: number;
  totalTopics: number;
  totalExplanations: number;
  totalAchievements: number;
  activeToday: number;
  activeThisWeek: number;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  xp: number;
  level: number;
  streak: number;
  topics: number;
  explanations: number;
  achievements: number;
  lastActive: string;
}

export default function DeveloperDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/admin/dashboard")
        .then(async (r) => {
          if (r.status === 403 || r.status === 401) {
            router.replace("/explore");
            return null;
          }
          return r.json();
        })
        .then((data) => {
          if (!data) return;
          setMetrics(data.metrics);
          setUsers(data.users);
        })
        .catch(() => setError("Failed to load dashboard"))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="zensei-loader w-8 h-8 text-accent" viewBox="0 0 50 30" fill="none">
          <path className="trace" d="M25 15c-4-6.5-10-10-15-10S2 8.5 2 15s3 10 8 10 11-3.5 15-10c4-6.5 10-10 15-10s8 3.5 8 10-3 10-8 10-11-3.5-15-10Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <PageShell maxWidth="lg">
        <div className="mt-6 bg-error/8 border border-error/20 rounded-xl p-4">
          <p className="text-error text-[13px] font-medium">{error}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="lg">
      <PageHeader
        badge="developer"
        badgeIcon="cog"
        badgeColor="gold"
        title="Developer Dashboard"
        subtitle="Platform metrics and user overview."
      />

      {metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard iconName="user" label="Users" value={metrics.totalUsers.toString()} />
            <StatCard iconName="compass" label="Topics" value={metrics.totalTopics.toString()} />
            <StatCard iconName="book-open" label="Explanations" value={metrics.totalExplanations.toLocaleString()} />
            <StatCard iconName="medal" label="Achievements" value={metrics.totalAchievements.toString()} />
            <StatCard iconName="bolt" label="Active Today" value={metrics.activeToday.toString()} color="text-accent" />
            <StatCard iconName="flame" label="Active 7d" value={metrics.activeThisWeek.toString()} color="text-ember" />
          </div>
          <section className="surface-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em]">
                All Users ({users.length})
              </h2>
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-text-dim uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-[11px] font-bold text-text-dim uppercase tracking-wider">Email</th>
                    <th className="text-center px-3 py-3 text-[11px] font-bold text-text-dim uppercase tracking-wider">Lv</th>
                    <th className="text-center px-3 py-3 text-[11px] font-bold text-text-dim uppercase tracking-wider">XP</th>
                    <th className="text-center px-3 py-3 text-[11px] font-bold text-text-dim uppercase tracking-wider">Topics</th>
                    <th className="text-center px-3 py-3 text-[11px] font-bold text-text-dim uppercase tracking-wider">Streak</th>
                    <th className="text-right px-5 py-3 text-[11px] font-bold text-text-dim uppercase tracking-wider">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/30 hover:bg-bg-hover/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-subtle shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-accent/20 to-gold/10 flex items-center justify-center">
                                <Icon name="user" className="w-3.5 h-3.5 text-text-dim" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium truncate max-w-[140px]">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted truncate max-w-[200px]">{u.email}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-pixel text-accent">{u.level}</span>
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums text-text-muted">{u.xp.toLocaleString()}</td>
                      <td className="px-3 py-3 text-center tabular-nums text-text-muted">{u.topics}</td>
                      <td className="px-3 py-3 text-center">
                        {u.streak > 0 ? (
                          <span className="font-pixel text-ember">{u.streak}d</span>
                        ) : (
                          <span className="text-text-dim">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-text-dim text-[12px]">
                        {u.lastActive || "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-border/30">
              {users.map((u) => (
                <div key={u.id} className="px-4 py-3.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-border-subtle shrink-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent/20 to-gold/10 flex items-center justify-center">
                          <Icon name="user" className="w-4 h-4 text-text-dim" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[14px] truncate">{u.name}</div>
                      <div className="text-[12px] text-text-muted truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-text-dim">
                    <span className="font-pixel text-accent">Lv.{u.level}</span>
                    <span>{u.xp.toLocaleString()} XP</span>
                    <span>{u.topics} topics</span>
                    {u.streak > 0 && (
                      <span className="font-pixel text-ember">{u.streak}d streak</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
