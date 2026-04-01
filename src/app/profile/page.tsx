"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/ui/PageShell";
import PageHeader from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import Loader from "@/components/ui/Loader";
import { useRef } from "react";
import {
  UserProfile,
  LearningStyle,
  KnowledgeLevel,
  DailyGoal,
  LEARNING_STYLES,
  KNOWLEDGE_LEVELS,
  DAILY_GOALS,
  EDUCATION_LEVELS,
  AGE_GROUPS,
} from "@/lib/types";

interface Progression {
  xp: number;
  level: number;
  xpProgress: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  rank: { name: string; icon: string };
  nextRank: { name: string; minLevel: number; icon: string } | null;
}

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [prog, setProg] = useState<Progression | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"idle" | "password" | "otp" | "deleting">("idle");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
      return;
    }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/profile").then((r) => r.json()),
        fetch("/api/progression").then((r) => r.json()),
      ])
        .then(([profileData, progData]) => {
          if (profileData.profile) {
            setProfile(profileData.profile);
            setDraft(profileData.profile);
          }
          if (progData.xp !== undefined) setProg(progData);
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    }
  }, [status, router]);

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!editing) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setDraft(data.profile);
      }
    } catch {}
    setEditing(false);
    setSaving(false);
  };

  const handleDeletePasswordSubmit = async () => {
    setDeleteError("");
    if (!deletePassword.trim()) {
      setDeleteError("Enter your password");
      return;
    }
    setDeleteStep("deleting");
    try {
      const res = await fetch("/api/auth/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Verification failed");
        setDeleteStep("password");
        return;
      }
      // Password verified, send OTP
      setDeleteEmail(data.email);
      const otpRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, type: "delete-account", password: deletePassword }),
      });
      if (!otpRes.ok) {
        const otpData = await otpRes.json();
        setDeleteError(otpData.error || "Failed to send code");
        setDeleteStep("password");
        return;
      }
      setDeleteStep("otp");
    } catch {
      setDeleteError("Something went wrong");
      setDeleteStep("password");
    }
  };

  const handleDeleteOtpSubmit = async () => {
    setDeleteError("");
    if (deleteOtp.length !== 6) {
      setDeleteError("Enter the 6-character code");
      return;
    }
    setDeleteStep("deleting");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: deleteEmail, code: deleteOtp, type: "delete-account" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Invalid code");
        setDeleteStep("otp");
        return;
      }
      await signOut({ redirect: false });
      router.push("/");
    } catch {
      setDeleteError("Something went wrong");
      setDeleteStep("otp");
    }
  };

  const resetDelete = () => {
    setDeleteStep("idle");
    setDeletePassword("");
    setDeleteOtp("");
    setDeleteEmail("");
    setDeleteError("");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate before uploading
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, or WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Show instant preview
    const previewUrl = URL.createObjectURL(file);
    const prevAvatar = profile?.avatar;
    setProfile((p) => p ? { ...p, avatar: previewUrl } : p);
    setDraft((d) => ({ ...d, avatar: previewUrl }));

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setDraft(data.profile);
        // Notify sidebar of the new avatar
        const avatarUrl = data.profile.avatar || data.avatarUrl;
        if (avatarUrl) {
          window.dispatchEvent(new CustomEvent("zensei:avatar-changed", { detail: avatarUrl }));
        }
      }
    } catch {
      // Revert preview on failure
      setProfile((p) => p ? { ...p, avatar: prevAvatar || "" } : p);
      setDraft((d) => ({ ...d, avatar: prevAvatar || "" }));
    }
    setUploadingAvatar(false);
    URL.revokeObjectURL(previewUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (status === "loading" || status === "unauthenticated" || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!profile) {
    return (
      <PageShell maxWidth="sm">
        <div className="text-center pt-20 animate-fade-in">
          <p className="text-text-muted text-[14px] mb-4">Profile not found. Complete onboarding first.</p>
          <button
            onClick={() => router.push("/")}
            className="btn-primary btn-tactile"
          >
            Go to Onboarding
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="sm">
      <PageHeader
        badge="profile"
        badgeIcon="user"
        title="Your Profile"
        subtitle="Your preferences shape how everything is explained to you."
        action={!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-ghost btn-tactile hover:border-accent/30 hover:text-accent"
          >
            Edit Profile
          </button>
        ) : undefined}
      />

      <div className="space-y-5">
        {/* Growth rank */}
        {prog && (
          <div className="surface-card p-5 sm:p-6 relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-accent/40 via-gold/30 to-transparent" />
            <h2 className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] mb-4">Growth</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-accent/20 to-gold/10 border border-accent/20 flex items-center justify-center shrink-0">
                <Icon name={prog.rank.icon} className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[16px] font-bold">{prog.rank.name}</span>
                  <span className="font-pixel text-text-dim uppercase tracking-wider">Lv. {prog.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-bg-inset overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all duration-500"
                      style={{ width: `${Math.max(3, prog.xpProgress * 100)}%` }}
                    />
                  </div>
                  <span className="font-pixel text-text-muted tabular-nums text-[11px]">
                    {prog.xp - prog.xpForCurrentLevel}/{prog.xpForNextLevel - prog.xpForCurrentLevel} XP
                  </span>
                </div>
                {prog.nextRank && (
                  <p className="text-[11px] text-text-dim mt-1.5 flex items-center gap-1">
                    <Icon name={prog.nextRank.icon} className="w-3 h-3" />
                    Next: {prog.nextRank.name} at level {prog.nextRank.minLevel}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="surface-card p-5 sm:p-6 rounded-2xl">
          <h2 className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] mb-4">Profile Picture</h2>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative group w-16 h-16 rounded-xl overflow-hidden border border-border-subtle shrink-0 focus-ring disabled:opacity-70 transition-all duration-150 hover:border-accent/40"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-gold/10 flex items-center justify-center">
                  <Icon name="user" className="w-7 h-7 text-text-dim" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {uploadingAvatar ? (
                  <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Icon name="camera" className="w-5 h-5 text-white" />
                )}
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium">
                {uploadingAvatar ? "Uploading..." : "Click photo to change"}
              </p>
              <p className="text-[11px] text-text-dim mt-1">JPG, PNG, or WebP. Max 2MB.</p>
            </div>
          </div>
        </div>

        <Section title="About You">
          {editing ? (
            <div className="space-y-3">
              <Field label="Name" value={draft.name ?? ""} onChange={(v) => setDraft({ ...draft, name: v })} />
              <Field label="Role" value={draft.role ?? ""} onChange={(v) => setDraft({ ...draft, role: v })} />
              <div>
                <label className="block text-[11px] text-text-dim font-bold mb-2 uppercase tracking-wider">Age Group</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(AGE_GROUPS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setDraft({ ...draft, ageGroup: key })}
                      className={`btn-tactile focus-ring px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 ${
                        draft.ageGroup === key
                          ? "bg-accent/10 border-accent/30 text-accent"
                          : "border-border text-text-muted hover:border-text-dim"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <InfoRow label="Name" value={profile.name} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Role" value={profile.role} />
              <InfoRow label="Age Group" value={AGE_GROUPS[profile.ageGroup] || "Not set"} />
            </div>
          )}
        </Section>

        <Section title="Education & Language">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-text-dim font-bold mb-2 uppercase tracking-wider">Education</label>
                <div className="space-y-1.5">
                  {Object.entries(EDUCATION_LEVELS).map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => setDraft({ ...draft, educationLevel: key })}
                      className={`btn-tactile focus-ring w-full text-left px-3.5 py-2.5 rounded-lg border text-[12px] font-medium transition-all duration-150 ${
                        draft.educationLevel === key
                          ? "bg-accent/10 border-accent/30 text-accent"
                          : "border-border text-text-secondary hover:border-text-dim"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <Field
                label="Preferred Language"
                value={draft.preferredLanguage ?? "English"}
                onChange={(v) => setDraft({ ...draft, preferredLanguage: v })}
              />
            </div>
          ) : (
            <div className="space-y-0.5">
              <InfoRow label="Education" value={EDUCATION_LEVELS[profile.educationLevel]?.label || "Not set"} />
              <InfoRow label="Language" value={profile.preferredLanguage || "English"} />
            </div>
          )}
        </Section>

        <Section title="Interests">
          {editing ? (
            <div>
              <input
                type="text"
                value={draft.interests?.join(", ") ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Comma-separated interests"
                className="input-field focus-ring text-[13px]"
              />
              <p className="text-[10px] text-text-dim mt-1.5">Separate with commas</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.interests.length > 0 ? profile.interests.map((i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-[12px] bg-accent/8 border border-accent/12 text-accent font-medium">
                  {i}
                </span>
              )) : (
                <span className="text-[13px] text-text-dim">No interests set</span>
              )}
            </div>
          )}
        </Section>

        <Section title="Learning Style">
          {editing ? (
            <div className="space-y-1.5">
              {(Object.entries(LEARNING_STYLES) as [LearningStyle, { label: string; description: string }][]).map(
                ([key, { label, description }]) => (
                  <button
                    key={key}
                    onClick={() => setDraft({ ...draft, learningStyle: key })}
                    className={`btn-tactile focus-ring w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
                      draft.learningStyle === key
                        ? "bg-accent/8 border-accent/30"
                        : "border-border hover:border-text-dim hover:bg-bg-hover"
                    }`}
                  >
                    <div className={`font-semibold text-[12px] ${draft.learningStyle === key ? "text-accent" : "text-text"}`}>{label}</div>
                    <div className="text-text-dim text-[11px] mt-0.5">{description}</div>
                  </button>
                )
              )}
            </div>
          ) : (
            <InfoRow label="Style" value={LEARNING_STYLES[profile.learningStyle]?.label || profile.learningStyle} />
          )}
        </Section>

        <Section title="Knowledge Level">
          {editing ? (
            <div className="space-y-1.5">
              {(Object.entries(KNOWLEDGE_LEVELS) as [KnowledgeLevel, { label: string; description: string }][]).map(
                ([key, { label, description }]) => (
                  <button
                    key={key}
                    onClick={() => setDraft({ ...draft, level: key })}
                    className={`btn-tactile focus-ring w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
                      draft.level === key
                        ? "bg-accent/8 border-accent/30"
                        : "border-border hover:border-text-dim hover:bg-bg-hover"
                    }`}
                  >
                    <div className={`font-semibold text-[12px] ${draft.level === key ? "text-accent" : "text-text"}`}>{label}</div>
                    <div className="text-text-dim text-[11px] mt-0.5">{description}</div>
                  </button>
                )
              )}
            </div>
          ) : (
            <InfoRow label="Level" value={KNOWLEDGE_LEVELS[profile.level]?.label || profile.level} />
          )}
        </Section>

        <Section title="Learning & Goals">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-text-dim font-bold mb-2 uppercase tracking-wider">Currently Learning</label>
                <textarea
                  value={draft.currentlyLearning ?? ""}
                  onChange={(e) => setDraft({ ...draft, currentlyLearning: e.target.value })}
                  placeholder="Courses, subjects, or skills you're working on..."
                  rows={2}
                  className="input-field focus-ring resize-none text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-text-dim font-bold mb-2 uppercase tracking-wider">Daily Goal</label>
                <div className="space-y-1.5">
                  {(Object.entries(DAILY_GOALS) as [DailyGoal, { label: string; description: string }][]).map(
                    ([key, { label }]) => (
                      <button
                        key={key}
                        onClick={() => setDraft({ ...draft, dailyGoal: key })}
                        className={`btn-tactile focus-ring w-full text-left px-3.5 py-2.5 rounded-lg border text-[12px] font-medium transition-all duration-150 ${
                          draft.dailyGoal === key
                            ? "bg-accent/10 border-accent/30 text-accent"
                            : "border-border text-text-secondary hover:border-text-dim"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-text-dim font-bold mb-2 uppercase tracking-wider">Weak Areas</label>
                <textarea
                  value={draft.weakAreas ?? ""}
                  onChange={(e) => setDraft({ ...draft, weakAreas: e.target.value })}
                  placeholder="Topics you find challenging..."
                  rows={2}
                  className="input-field focus-ring resize-none text-[13px]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              {profile.currentlyLearning && <InfoRow label="Currently Learning" value={profile.currentlyLearning} />}
              <InfoRow label="Daily Goal" value={DAILY_GOALS[profile.dailyGoal as DailyGoal]?.label || profile.dailyGoal || "Not set"} />
              {profile.weakAreas && <InfoRow label="Weak Areas" value={profile.weakAreas} />}
            </div>
          )}
        </Section>

        {!editing && (
          <div className="surface-card border-error/15 p-5 sm:p-6 rounded-2xl">
            <h2 className="text-[11px] font-bold text-error uppercase tracking-[0.15em] mb-3">Leave the Garden</h2>
            <p className="text-[13px] text-text-muted mb-4 leading-relaxed">
              This will permanently remove your account, progress, XP, and all saved topics. This cannot be undone.
            </p>

            {deleteError && (
              <p className="text-[12px] text-error mb-3">{deleteError}</p>
            )}

            {deleteStep === "idle" && (
              <button
                onClick={() => setDeleteStep("password")}
                className="btn-tactile focus-ring px-4 py-2.5 rounded-xl text-[12px] font-medium border border-error/25 text-error hover:bg-error/8 transition-all duration-150"
              >
                Delete my account
              </button>
            )}

            {deleteStep === "password" && (
              <div className="space-y-3 animate-fade-up">
                <p className="text-[13px] font-semibold text-error">Enter your password to continue</p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeletePasswordSubmit()}
                  placeholder="Your password"
                  className="password-dots-lg w-full sm:w-64 px-3 py-2.5 rounded-xl bg-bg-inset border border-border text-[13px] text-text placeholder:text-text-dim focus:outline-none focus:border-error/40 transition-colors"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeletePasswordSubmit}
                    className="btn-tactile px-4 py-2.5 bg-error hover:bg-error/90 text-white rounded-xl text-[12px] font-semibold transition-all duration-150"
                  >
                    Continue
                  </button>
                  <button onClick={resetDelete} className="btn-ghost">
                    Keep my garden
                  </button>
                </div>
              </div>
            )}

            {deleteStep === "otp" && (
              <div className="space-y-3 animate-fade-up">
                <p className="text-[13px] font-semibold text-error">We sent a verification code to your email</p>
                <p className="text-[12px] text-text-muted">Enter the 6-character code to confirm deletion.</p>
                <input
                  type="text"
                  inputMode="text"
                  maxLength={6}
                  value={deleteOtp}
                  onChange={(e) => setDeleteOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleDeleteOtpSubmit()}
                  placeholder="XXXXXX"
                  className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-bg-inset border border-border text-[15px] text-text text-center font-mono tracking-[0.3em] placeholder:text-text-dim focus:outline-none focus:border-error/40 transition-colors"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteOtpSubmit}
                    className="btn-tactile px-4 py-2.5 bg-error hover:bg-error/90 text-white rounded-xl text-[12px] font-semibold transition-all duration-150"
                  >
                    Yes, delete everything
                  </button>
                  <button onClick={resetDelete} className="btn-ghost">
                    Keep my garden
                  </button>
                </div>
              </div>
            )}

            {deleteStep === "deleting" && (
              <div className="flex items-center gap-3 py-2 animate-fade-up">
                <svg className="zensei-loader w-5 h-5 text-error" viewBox="0 0 50 30" fill="none">
                  <path className="trace" d="M25 15c-4-6.5-10-10-15-10S2 8.5 2 15s3 10 8 10 11-3.5 15-10c4-6.5 10-10 15-10s8 3.5 8 10-3 10-8 10-11-3.5-15-10Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="text-[13px] text-text-muted">Processing...</span>
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary btn-tactile">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => { setDraft(profile); setEditing(false); }}
              className="btn-ghost btn-tactile"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-5 sm:p-6 rounded-2xl">
      <h2 className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-text-muted">{label}</span>
      <span className="text-[13px] font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] text-text-dim font-bold mb-2 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field focus-ring text-[13px]"
      />
    </div>
  );
}
