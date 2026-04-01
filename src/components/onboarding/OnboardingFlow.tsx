"use client";

import { useState } from "react";
import {
  LearningStyle,
  KnowledgeLevel,
  DailyGoal,
  LEARNING_STYLES,
  KNOWLEDGE_LEVELS,
  DAILY_GOALS,
  EDUCATION_LEVELS,
  AGE_GROUPS,
} from "@/lib/types";

interface OnboardingData {
  role: string;
  interests: string[];
  learningStyle: LearningStyle;
  level: KnowledgeLevel;
  educationLevel: string;
  preferredLanguage: string;
  dailyGoal: DailyGoal;
  weakAreas: string;
  currentlyLearning: string;
  ageGroup: string;
  timezone: string;
}

interface Props {
  onComplete: (data: OnboardingData) => void;
}

const SUGGESTED_INTERESTS = [
  "Technology", "Science", "Music", "Art", "Business",
  "Psychology", "Philosophy", "History", "Sports", "Cooking",
  "Gaming", "Movies", "Literature", "Mathematics", "Health",
  "Finance", "Design", "Politics", "Nature", "Travel",
  "Engineering", "Medicine", "Law", "Education", "Astronomy",
];

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German",
  "Arabic", "Chinese", "Japanese", "Korean", "Portuguese",
  "Russian", "Italian", "Urdu", "Turkish", "Other",
];

const STEP_META = [
  { title: "About You", subtitle: "A few basics so explanations feel right from the start.", tag: "identity", icon: "user" },
  { title: "Your Background", subtitle: "This helps us find the right starting point.", tag: "training", icon: "scroll" },
  { title: "Your Interests", subtitle: "Pick the topics that spark your curiosity.", tag: "interests", icon: "compass" },
  { title: "Language", subtitle: "Choose the language that feels most natural.", tag: "language", icon: "globe" },
  { title: "How You Learn Best", subtitle: "This shapes how explanations are crafted for you.", tag: "style", icon: "brain" },
  { title: "Depth Preference", subtitle: "How detailed should explanations be?", tag: "depth", icon: "layers" },
  { title: "What You're Learning", subtitle: "Anything you're already working on?", tag: "current", icon: "book" },
  { title: "Almost Done", subtitle: "Set your pace and let's begin.", tag: "finish", icon: "flag" },
];

export default function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(() => ({
    role: "",
    interests: [],
    learningStyle: "analogies",
    level: "intermediate",
    educationLevel: "",
    preferredLanguage: "English",
    dailyGoal: "casual",
    weakAreas: "",
    currentlyLearning: "",
    ageGroup: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  }));

  const totalSteps = 8;
  const { title, subtitle, tag } = STEP_META[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const steps = [
    <div key="intro" className="space-y-5 animate-fade-up">
      <div>
        <label className="block text-[12px] text-text-muted font-semibold mb-2 uppercase tracking-wider">What do you do?</label>
        <input
          type="text"
          placeholder="e.g. Software engineer, Student, Designer, Chef..."
          value={data.role}
          onChange={(e) => setData({ ...data, role: e.target.value })}
          className="input-field focus-ring"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[12px] text-text-muted font-semibold mb-2.5 uppercase tracking-wider">Age group</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(AGE_GROUPS).map(([key, label]) => (
            <SelectPill key={key} selected={data.ageGroup === key} onClick={() => setData({ ...data, ageGroup: key })} label={label} />
          ))}
        </div>
      </div>
    </div>,

    <div key="education" className="space-y-2 animate-fade-up">
      {Object.entries(EDUCATION_LEVELS).map(([key, { label, description }]) => (
        <OptionRow key={key} selected={data.educationLevel === key} onClick={() => setData({ ...data, educationLevel: key })}
          title={label} description={description} />
      ))}
    </div>,

    <div key="interests" className="animate-fade-up">
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_INTERESTS.map((interest) => {
          const isSelected = data.interests.includes(interest);
          return (
            <SelectPill key={interest} selected={isSelected}
              onClick={() => {
                const interests = isSelected
                  ? data.interests.filter((i) => i !== interest)
                  : [...data.interests, interest];
                setData({ ...data, interests });
              }}
              label={interest} />
          );
        })}
      </div>
      {data.interests.length > 0 && (
        <p className="font-pixel text-accent mt-4 uppercase tracking-wider">
          {data.interests.length} selected
        </p>
      )}
    </div>,

    <div key="language" className="animate-fade-up">
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => (
          <SelectPill key={lang} selected={data.preferredLanguage === lang}
            onClick={() => setData({ ...data, preferredLanguage: lang })} label={lang} />
        ))}
      </div>
    </div>,

    <div key="style" className="space-y-2 animate-fade-up">
      {(Object.entries(LEARNING_STYLES) as [LearningStyle, { label: string; description: string }][]).map(
        ([key, { label, description }]) => (
          <OptionRow key={key} selected={data.learningStyle === key}
            onClick={() => setData({ ...data, learningStyle: key })}
            title={label} description={description} />
        )
      )}
    </div>,

    <div key="level" className="space-y-2 animate-fade-up">
      {(Object.entries(KNOWLEDGE_LEVELS) as [KnowledgeLevel, { label: string; description: string }][]).map(
        ([key, { label, description }]) => (
          <OptionRow key={key} selected={data.level === key}
            onClick={() => setData({ ...data, level: key })}
            title={label} description={description} />
        )
      )}
    </div>,

    <div key="currently-learning" className="animate-fade-up">
      <textarea
        placeholder="e.g. Taking a digital electronics course, learning React, studying for GRE..."
        value={data.currentlyLearning}
        onChange={(e) => setData({ ...data, currentlyLearning: e.target.value })}
        rows={4}
        className="input-field focus-ring resize-none"
        autoFocus
      />
      <p className="text-[11px] text-text-dim mt-2">Optional, but it helps personalize your explanations</p>
    </div>,

    <div key="goals" className="space-y-5 animate-fade-up">
      <div>
        <label className="block text-[12px] text-text-muted font-semibold mb-2.5 uppercase tracking-wider">How often do you plan to learn?</label>
        <div className="space-y-2">
          {(Object.entries(DAILY_GOALS) as [DailyGoal, { label: string; description: string }][]).map(
            ([key, { label, description }]) => (
              <OptionRow key={key} selected={data.dailyGoal === key}
                onClick={() => setData({ ...data, dailyGoal: key })}
                title={label} description={description} />
            )
          )}
        </div>
      </div>
      <div>
        <label className="block text-[12px] text-text-muted font-semibold mb-2 uppercase tracking-wider">
          Topics you find challenging?
        </label>
        <textarea
          placeholder="e.g. Advanced math feels overwhelming, organic chemistry never clicks..."
          value={data.weakAreas}
          onChange={(e) => setData({ ...data, weakAreas: e.target.value })}
          rows={3}
          className="input-field focus-ring resize-none"
        />
        <p className="text-[11px] text-text-dim mt-1.5">Optional</p>
      </div>
    </div>,
  ];

  const canProceed =
    step === 0 ? data.role.trim() && data.ageGroup :
    step === 1 ? data.educationLevel :
    step === 2 ? data.interests.length >= 1 :
    step === 3 ? data.preferredLanguage :
    true;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overscroll-y-none bg-bg">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="hidden sm:block absolute top-1/4 left-1/5 w-96 h-96 bg-accent/[0.03] rounded-full blur-[120px]" />
          <div className="hidden sm:block absolute bottom-1/4 right-1/5 w-80 h-80 bg-gold/[0.025] rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-xl relative">
          <div className="quest-frame rounded-2xl bg-bg-card/70 backdrop-blur-sm border border-border-subtle p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-accent/15 border border-accent/25 flex items-center justify-center">
                  <LevelIcon className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="font-pixel text-accent uppercase tracking-wider">Quest Setup</span>
              </div>
              <span className="font-pixel text-text-dim uppercase tracking-wider">
                {step + 1} of {totalSteps}
              </span>
            </div>
            <div className="h-2 bg-bg-inset rounded-full overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-5 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/8 border border-accent/15 mb-3">
              <QuestIcon className="w-3 h-3 text-accent" />
              <span className="font-pixel text-accent uppercase tracking-widest">{tag}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1.5">{title}</h2>
            <p className="text-text-muted text-[13px] leading-relaxed">{subtitle}</p>
          </div>

          {steps[step]}

          <div className="flex justify-between mt-8 sm:mt-10 gap-2">
            <button
              onClick={() => setStep(step - 1)}
              className={`btn-ghost btn-tactile flex items-center gap-1.5 ${step === 0 ? "invisible" : ""}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
              Back
            </button>
            <button
              onClick={() => {
                if (step < steps.length - 1) setStep(step + 1);
                else onComplete(data);
              }}
              disabled={!canProceed}
              className="btn-primary btn-tactile flex items-center gap-2"
            >
              {step === steps.length - 1 ? (
                <>
                  <SparkleIcon className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  Continue
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                </>
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function SelectPill({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`btn-tactile focus-ring relative px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-150 ${
        selected
          ? "bg-accent/10 border-accent/35 text-accent shadow-[0_0_12px_rgba(139,171,122,0.08)]"
          : "border-border text-text-muted hover:border-text-dim hover:text-text-secondary hover:bg-bg-hover"
      }`}>
      {selected && (
        <div className="absolute inset-0 rounded-xl border border-accent/15 animate-pulse-glow" />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function OptionRow({ selected, onClick, title, description }: {
  selected: boolean; onClick: () => void; title: string; description: string;
}) {
  return (
    <button onClick={onClick}
      className={`btn-tactile focus-ring w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 ${
        selected
          ? "bg-accent/8 border-accent/30"
          : "border-border hover:border-text-dim hover:bg-bg-hover"
      }`}>
      <div className={`font-semibold text-[13px] ${selected ? "text-accent" : "text-text"}`}>{title}</div>
      <div className="text-text-muted text-[12px] mt-0.5">{description}</div>
    </button>
  );
}

function LevelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function QuestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  );
}
