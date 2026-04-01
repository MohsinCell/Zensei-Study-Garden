"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import { TopicEntry } from "@/lib/types";
import { formatDate, ratingLabel, ratingColor } from "@/lib/utils";
import Link from "next/link";

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [topics, setTopics] = useState<TopicEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "struggling" | "mastered">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/topics")
        .then((r) => r.json())
        .then((data) => {
          setTopics(data.topics ?? []);
          setLoading(false);
        })
        .catch(() => { setLoading(false); setError(true); });
    }
  }, [status, router]);

  const filtered = topics.filter((t) => {
    if (filter === "struggling") return t.rating !== null && t.rating <= 2;
    if (filter === "mastered") return t.rating !== null && t.rating >= 4;
    return true;
  });

  const allTags = Array.from(new Set(topics.flatMap((t) => t.tags)));

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
        badge="journal"
        badgeIcon="book-open"
        title="Your Journal"
        subtitle={`Everything you've explored so far. ${topics.length} topic${topics.length !== 1 ? "s" : ""}.`}
      />

      <div className="flex gap-2 mb-6">
        {(["all", "struggling", "mastered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn-tactile focus-ring px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all duration-150 ${
              filter === f
                ? "bg-accent/10 border-accent/30 text-accent"
                : "border-border text-text-muted hover:border-text-dim hover:text-text-secondary"
            }`}
          >
            {f === "all" ? "All" : f === "struggling" ? "Needs Work" : "Mastered"}
          </button>
        ))}
      </div>

      {topics.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-8">
          <StatCard iconName="compass" label="Explored" value={topics.length.toString()} />
          <StatCard iconName="check-badge" label="Under­stood" value={topics.filter((t) => t.rating && t.rating >= 4).length.toString()} color="text-success" />
          <StatCard iconName="flag" label="Needs Review" value={topics.filter((t) => t.rating && t.rating <= 2).length.toString()} color="text-warning" />
        </div>
      )}

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {allTags.slice(0, 15).map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg text-[11px] bg-bg-surface border border-border-subtle text-text-dim font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : error ? (
        <div className="mt-6 bg-error/8 border border-error/20 rounded-xl p-4">
          <p className="text-error text-[13px] font-medium">Failed to load your journal. Please try again.</p>
          <button onClick={() => { setError(false); setLoading(true); fetch("/api/topics").then(r => r.json()).then(data => { setTopics(data.topics ?? []); setLoading(false); }).catch(() => { setLoading(false); setError(true); }); }}
            className="text-[12px] text-error/60 hover:text-error mt-1.5 transition-colors">
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        topics.length === 0 ? (
          <EmptyState
            icon={<BookOpenIcon className="w-10 h-10 text-text-dim" />}
            title="Nothing here yet"
            description="Your journal starts when you explore your first topic. Give it a try!"
            actionLabel="Start Exploring"
            actionHref="/explore"
            actionIcon={<CompassSmallIcon className="w-4 h-4" />}
          />
        ) : (
          <EmptyState
            icon={<FilterIcon className="w-10 h-10 text-text-dim" />}
            title="No matches found"
            description="No topics match this filter."
            actionLabel="Show All"
            actionIcon={<CompassSmallIcon className="w-4 h-4" />}
            onAction={() => setFilter("all")}
          />
        )
      ) : (
        <div className="space-y-1.5">
          {filtered.map((topic, i) => (
            <Link
              key={topic.id}
              href={`/explore?topic=${topic.id}`}
              className="block surface-card p-4 hover:border-accent/25 hover:bg-bg-hover transition-all duration-150 group animate-fade-up rounded-xl"
              style={{ animationDelay: `${Math.min(i * 30, 200)}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[14px] truncate group-hover:text-accent transition-colors duration-150">
                    {topic.topic}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-text-dim">{formatDate(topic.createdAt)}</span>
                    <span className="text-[11px] text-text-dim">
                      {topic.explanations.length} explanation{topic.explanations.length !== 1 ? "s" : ""}
                    </span>
                    {topic.tags.length > 0 && (
                      <span className="text-[11px] text-text-dim">{topic.tags.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  {topic.rating !== null ? (
                    <span className={`text-[11px] font-semibold ${ratingColor(topic.rating)}`}>
                      {ratingLabel(topic.rating)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-text-dim">Unrated</span>
                  )}
                  <svg className="w-4 h-4 text-text-dim group-hover:text-accent transition-colors duration-150" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function CompassSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12Z" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
  );
}
