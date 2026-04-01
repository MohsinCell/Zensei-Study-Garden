"use client";

import PageShell from "@/components/ui/PageShell";
import Icon from "@/components/ui/Icon";
import { Mail } from "lucide-react";

const FEATURES = [
  {
    icon: "compass",
    title: "Explore Any Topic",
    description:
      "Type anything you want to learn. Zensei generates personalized explanations tailored to your background, interests, and learning style.",
  },
  {
    icon: "bolt",
    title: "Adaptive Learning",
    description:
      "Go deeper, simplify, ask follow-ups, or request examples and analogies. Every interaction adapts to how you learn best.",
  },
  {
    icon: "trophy",
    title: "Gamified Progress",
    description:
      "Earn XP, level up through ranks from Seed to Elder Tree, unlock achievements, and maintain daily streaks to stay motivated.",
  },
  {
    icon: "book-open",
    title: "Learning Journal",
    description:
      "Every topic you explore is saved with your ratings, tags, and notes. Track what you've mastered and what needs review.",
  },
  {
    icon: "brain",
    title: "AI-Powered Insights",
    description:
      "Zensei learns your strengths and weak spots over time, giving you smarter explanations the more you use it.",
  },
  {
    icon: "star",
    title: "Rate and Reflect",
    description:
      "Rate your understanding after each topic. Your feedback shapes future explanations and tracks your growth.",
  },
];

export default function AboutPage() {
  return (
    <PageShell maxWidth="md">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/8 border border-accent/15 mb-4">
          <Icon name="sprout" className="w-4 h-4 text-accent" />
          <span className="font-pixel text-accent uppercase tracking-wider">about</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">About <span className="font-pixel uppercase tracking-[0.1em] text-accent text-[length:inherit]" style={{ textShadow: "0 0 10px rgba(139,171,122,0.4)" }}>Zensei</span></h1>
        <p className="text-text-muted text-[14px] leading-relaxed">
          A gamified study companion that makes learning anything feel like play.
        </p>
      </div>

      <div className="space-y-8">

        <section className="surface-card p-5 sm:p-6 rounded-2xl">
          <h2 className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] mb-4">
            What is Zensei?
          </h2>
          <div className="space-y-3 text-[14px] text-text-muted leading-relaxed">
            <p>
              Zensei is a personal study garden where you can explore any topic and get
              explanations tailored specifically to you. It adapts to your role, education,
              interests, and preferred learning style to make every explanation feel like it
              was written just for you.
            </p>
            <p>
              Built with a gamification system inspired by RPGs, Zensei turns learning into a
              rewarding experience. Earn XP for exploring topics, maintain streaks for
              consistency, unlock achievements for milestones, and grow your rank from a
              small Seed into an Elder Tree.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] mb-4 px-1">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="surface-card p-4 sm:p-5 rounded-xl group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
                    <Icon name={f.icon} className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold mb-1">{f.title}</h3>
                    <p className="text-[12px] text-text-muted leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-accent/40 via-gold/30 to-transparent" />
          <h2 className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] mb-4">
            Developer
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-gold/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Icon name="user" className="w-7 h-7 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-bold">Mohsin Belam</h3>
              <p className="text-[13px] text-text-muted mt-0.5">
                Creator and developer of Zensei
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://github.com/MohsinCell"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium border border-border hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-all duration-150"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="mailto:mohsinbelam@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium border border-border hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-all duration-150"
            >
              <Mail className="w-4 h-4" />
              mohsinbelam@gmail.com
            </a>
          </div>
        </section>

      </div>
    </PageShell>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}
