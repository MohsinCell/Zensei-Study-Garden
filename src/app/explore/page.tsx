"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TopicInput from "@/components/explain/TopicInput";
import ExplanationCard from "@/components/explain/ExplanationCard";
import IntentDialog from "@/components/explain/IntentDialog";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import Icon from "@/components/ui/Icon";
import Loader from "@/components/ui/Loader";
import { Explanation, UserProfile, DepthPreference, PurposeIntent } from "@/lib/types";

interface TopicState {
  id: string;
  topic: string;
  explanations: Explanation[];
}

interface ProgressionToast {
  id: number;
  type: "xp" | "level" | "achievement" | "streak";
  message: string;
  sub?: string;
  icon: string;
}

const LEVEL_UP_MESSAGES = [
  "You grew a level!",
  "New level reached!",
  "Nicely done, keep going!",
  "Another step forward!",
  "Growing steadily!",
];

const ACHIEVEMENT_MESSAGES = [
  "Badge earned!",
  "New badge!",
  "Well done!",
  "You earned this one!",
];

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingInfinity />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}

const GROWING_MESSAGES = [
  "Going deeper...",
  "Branching out...",
  "Finding more angles...",
  "Building on that...",
  "Adding another layer...",
];

function pickRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentTopic, setCurrentTopic] = useState<TopicState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [toasts, setToasts] = useState<ProgressionToast[]>([]);
  const toastIdRef = useRef(0);
  const explanationsEndRef = useRef<HTMLDivElement>(null);

  const showProgressionToasts = (progression: {
    xpAwarded: number;
    leveledUp: boolean;
    levelAfter: number;
    streakAfter: number;
    streakBefore: number;
    streakMultiplier: number;
    newAchievements: Array<{ name: string; icon: string; xpReward: number }>;
  }) => {
    const newToasts: ProgressionToast[] = [];

    if (progression.xpAwarded > 0) {
      newToasts.push({
        id: ++toastIdRef.current,
        type: "xp",
        message: `+${progression.xpAwarded} XP`,
        sub: progression.streakMultiplier > 1 ? `${progression.streakMultiplier}x streak bonus` : undefined,
        icon: "bolt",
      });
    }

    if (progression.streakAfter > progression.streakBefore && progression.streakAfter > 1) {
      newToasts.push({
        id: ++toastIdRef.current,
        type: "streak",
        message: `${progression.streakAfter}-day streak!`,
        sub: "Keep it going!",
        icon: "flame",
      });
    }

    if (progression.leveledUp) {
      newToasts.push({
        id: ++toastIdRef.current,
        type: "level",
        message: `Level ${progression.levelAfter}!`,
        sub: pickRandom(LEVEL_UP_MESSAGES),
        icon: "arrow-up",
      });
    }

    for (const ach of progression.newAchievements) {
      newToasts.push({
        id: ++toastIdRef.current,
        type: "achievement",
        message: ach.name,
        sub: `${pickRandom(ACHIEVEMENT_MESSAGES)} +${ach.xpReward} XP`,
        icon: ach.icon,
      });
    }

    if (newToasts.length > 0) {
      setToasts((prev) => [...prev, ...newToasts]);
      newToasts.forEach((t, i) => {
        setTimeout(() => {
          setToasts((prev) => prev.filter((p) => p.id !== t.id));
        }, 5000 + i * 1200);
      });
    }

    // Notify sidebar to refresh progression data
    window.dispatchEvent(new Event("zensei-progression-update"));
  };

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      setProfileLoading(true);
      fetch("/api/profile")
        .then(async (r) => {
          if (r.status === 401) {
            router.replace("/auth/signin");
            return null;
          }
          if (!r.ok) {
            throw new Error("Failed to load profile");
          }
          return r.json();
        })
        .then((data) => {
          if (!data) return;
          setProfile(data.profile);
          const role = data.profile?.role?.trim() ?? "";
          setShowOnboarding(!role);
        })
        .catch(() => {
          setError("Unable to load your profile. Please refresh.");
        })
        .finally(() => setProfileLoading(false));
    }
  }, [status, router]);

  useEffect(() => {
    const topicId = searchParams.get("topic");
    if (topicId && !currentTopic) {
      setLoadingHistory(true);
      fetch(`/api/topics?id=${topicId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.topic) {
            setCurrentTopic({ id: data.topic.id, topic: data.topic.topic, explanations: data.topic.explanations });
          }
        })
        .catch(() => { setError("Failed to load topic. Try opening it again from the journal."); })
        .finally(() => setLoadingHistory(false));
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentTopic && currentTopic.explanations.length > 1) {
      explanationsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentTopic?.explanations.length]);

  const handleTopicSubmit = (topic: string) => setPendingTopic(topic);

  const handleIntentConfirm = async (depth: DepthPreference, purpose: PurposeIntent) => {
    if (!pendingTopic) return;
    const topic = pendingTopic;
    setPendingTopic(null);
    setIsLoading(true);
    setError(null);
    setCurrentTopic(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mode: "initial", depthPreference: depth, purposeIntent: purpose }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to generate explanation"); }
      const data = await res.json();
      setCurrentTopic({ id: data.topicId, topic, explanations: [data.explanation] });
      if (data.progression) showProgressionToasts(data.progression);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (mode: "simplified" | "deeper" | "example" | "analogy") => {
    if (!currentTopic) return;
    setIsLoading(true);
    setError(null);
    setTimeout(() => explanationsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    const lastExp = currentTopic.explanations[currentTopic.explanations.length - 1];
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic.topic, mode, topicId: currentTopic.id,
          previousExplanation: lastExp.sections.core,
          depthPreference: lastExp.depthPreference || "detailed",
          purposeIntent: lastExp.purposeIntent || "curiosity",
        }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      const data = await res.json();
      setCurrentTopic({ ...currentTopic, explanations: [...currentTopic.explanations, data.explanation] });
      if (data.progression) showProgressionToasts(data.progression);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowup = async (query: string) => {
    if (!currentTopic) return;
    setIsLoading(true);
    setError(null);
    setTimeout(() => explanationsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    const lastExp = currentTopic.explanations[currentTopic.explanations.length - 1];
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic.topic, mode: "followup", topicId: currentTopic.id,
          previousExplanation: lastExp.sections.core, followupQuery: query,
          depthPreference: lastExp.depthPreference || "detailed",
          purposeIntent: lastExp.purposeIntent || "curiosity",
        }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      const data = await res.json();
      setCurrentTopic({ ...currentTopic, explanations: [...currentTopic.explanations, data.explanation] });
      if (data.progression) showProgressionToasts(data.progression);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!currentTopic) return;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: currentTopic.id, rating }),
      });
      const data = await res.json();
      if (data.progression) showProgressionToasts(data.progression);
    } catch {}
  };

  const handleNewTopic = () => {
    setCurrentTopic(null);
    setError(null);
    window.history.replaceState(null, "", "/explore");
  };

  // Show loading while checking auth OR while loading profile
  if (status === "loading" || status === "unauthenticated" || (status === "authenticated" && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingInfinity />
      </div>
    );
  }

  // Profile loaded but no role means onboarding needed - show loading until state updates
  if (status === "authenticated" && profile && !profile.role?.trim() && !showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingInfinity />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={async (data) => {
          const res = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            setError("Could not save onboarding. Please try again.");
            return;
          }
          const updated = await fetch("/api/profile");
          if (updated.ok) {
            const d = await updated.json();
            setProfile(d.profile);
          }
          setShowOnboarding(false);
        }}
      />
    );
  }

  const depthMode = currentTopic?.explanations[0]?.depthPreference;
  const purposeMode = currentTopic?.explanations[0]?.purposeIntent;
  const modeClass = [
    depthMode === "brief" ? "mode-quick" : depthMode === "detailed" ? "mode-deep" : "",
    purposeMode === "exam" ? "mode-exam" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2.5 pointer-events-none">
          {toasts.map((toast, i) => (
            <div
              key={toast.id}
              style={{ animationDelay: `${i * 100}ms` }}
              className={`animate-slide-in-right pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-elevated ${
                toast.type === "achievement"
                  ? "bg-gold/15 border-gold/25"
                  : toast.type === "level"
                    ? "bg-accent/15 border-accent/25"
                    : toast.type === "streak"
                      ? "bg-ember/15 border-ember/25"
                      : "bg-bg-card/90 border-border"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                toast.type === "achievement" ? "bg-gold/20" :
                toast.type === "level" ? "bg-accent/20" :
                toast.type === "streak" ? "bg-ember/20" : "bg-bg-elevated"
              }`}>
                <Icon
                  name={toast.icon}
                  className={`w-4 h-4 ${
                    toast.type === "achievement" ? "text-gold" :
                    toast.type === "level" ? "text-accent" :
                    toast.type === "streak" ? "text-ember" : "text-text"
                  }`}
                />
              </div>
              <div>
                <p className={`text-[13px] font-bold ${
                  toast.type === "achievement" ? "text-gold" :
                  toast.type === "level" ? "text-accent" :
                  toast.type === "streak" ? "text-ember" : "text-text"
                }`}>
                  {toast.message}
                </p>
                {toast.sub && (
                  <p className="text-[11px] text-text-muted">{toast.sub}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingTopic && (
        <IntentDialog topic={pendingTopic} onConfirm={handleIntentConfirm} onCancel={() => setPendingTopic(null)} />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-5 md:px-10 pt-20 pb-6 sm:pt-8 sm:pb-8 md:pt-12 md:pb-12 animate-page-in">
          {!currentTopic && !isLoading && !loadingHistory && (
            <TopicInput onSubmit={handleTopicSubmit} isLoading={isLoading} userName={profile?.name ?? ""} profile={profile} />
          )}

          {(isLoading && !currentTopic) || loadingHistory ? (
            <div className="mt-20 flex flex-col items-center gap-4 animate-fade-up">
              <LoadingInfinity />
            </div>
          ) : null}

          {error && (
            <div className="mt-6 bg-error/8 border border-error/20 rounded-xl p-4 animate-fade-up">
              <p className="text-error text-[13px] font-medium">{error}</p>
              <button onClick={() => setError(null)}
                className="text-[12px] text-error/60 hover:text-error mt-1.5 transition-colors">
                Dismiss
              </button>
            </div>
          )}

          {currentTopic && (
            <div className={`space-y-8 animate-fade-up ${modeClass}`}>
              <div className="flex items-start justify-between gap-3 pt-4">
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-tight">
                    {currentTopic.topic}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5">
                    <p className="font-pixel text-text-dim uppercase tracking-wider">
                      {currentTopic.explanations.length} exploration{currentTopic.explanations.length > 1 ? "s" : ""}
                    </p>
                    {currentTopic.explanations[0] && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`font-pixel px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 ${
                          currentTopic.explanations[0].depthPreference === "brief"
                            ? "bg-accent/10 text-accent border border-accent/15"
                            : "bg-accent/15 text-accent border border-accent/20"
                        }`}>
                          <Icon
                            name={currentTopic.explanations[0].depthPreference === "brief" ? "speed-lines" : "layers"}
                            className="w-3 h-3"
                          />
                          {currentTopic.explanations[0].depthPreference === "brief" ? "quick" : "deep"}
                        </span>
                        <span className={`font-pixel px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 ${
                          currentTopic.explanations[0].purposeIntent === "exam"
                            ? "bg-gold/15 text-gold border border-gold/20"
                            : "bg-gold/10 text-gold border border-gold/15"
                        }`}>
                          <Icon
                            name={currentTopic.explanations[0].purposeIntent === "exam" ? "graduation-cap" : "light-spark"}
                            className="w-3 h-3"
                          />
                          {currentTopic.explanations[0].purposeIntent === "exam" ? "study" : "curious"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={handleNewTopic}
                  className="btn-ghost btn-tactile shrink-0 hover:border-accent/30 hover:text-accent hover:bg-accent/5 text-[12px] sm:text-[13px]">
                  New Topic
                </button>
              </div>

              {currentTopic.explanations.map((exp, i) => (
                <ExplanationCard key={exp.id} explanation={exp} topicId={currentTopic.id} topic={currentTopic.topic}
                  onAction={handleAction} onFollowup={handleFollowup} onRate={handleRate}
                  isLoading={isLoading} isLatest={i === currentTopic.explanations.length - 1} />
              ))}

              {isLoading && currentTopic.explanations.length > 0 && (
                <div className="flex items-center justify-center gap-3 py-8 animate-fade-up">
                  <svg className="zensei-loader w-6 h-6 text-accent" viewBox="0 0 50 30" fill="none"><path className="trace" d="M25 15c-4-6.5-10-10-15-10S2 8.5 2 15s3 10 8 10 11-3.5 15-10c4-6.5 10-10 15-10s8 3.5 8 10-3 10-8 10-11-3.5-15-10Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
                  <span className="text-text-muted text-[13px] font-pixel uppercase tracking-widest">{pickRandom(GROWING_MESSAGES)}</span>
                </div>
              )}

              <div ref={explanationsEndRef} />
            </div>
          )}
      </div>
    </>
  );
}

function LoadingInfinity() {
  return <Loader size="lg" />;
}
