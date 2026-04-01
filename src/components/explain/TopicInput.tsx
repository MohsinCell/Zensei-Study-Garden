"use client";

import { useState, useRef, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import Icon from "@/components/ui/Icon";

interface Props {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
  userName: string;
  profile?: UserProfile | null;
}

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  engineer: [
    "How does a transistor amplify signals?",
    "What is Fourier transform and why does it matter?",
    "How do CPUs execute instructions?",
    "What is impedance matching?",
    "How does PID control work?",
    "What is the difference between AC and DC motors?",
  ],
  software: [
    "How does garbage collection work?",
    "What are design patterns and when to use them?",
    "How does HTTPS encryption actually work?",
    "What is the CAP theorem?",
    "How do neural networks learn?",
  ],
  student: [
    "How does the scientific method work?",
    "What is the difference between correlation and causation?",
    "How does memory consolidation work during sleep?",
    "How do vaccines train the immune system?",
  ],
  designer: [
    "What is Gestalt theory in design?",
    "How does color psychology affect user behavior?",
    "What makes a typeface readable?",
    "How does visual hierarchy guide attention?",
  ],
  doctor: [
    "How does CRISPR gene editing work?",
    "What actually happens during anesthesia?",
    "How do antibiotics resistance develop?",
    "What is the blood-brain barrier?",
  ],
  business: [
    "What is the difference between revenue and profit?",
    "How does compound interest actually work?",
    "What is supply and demand really about?",
    "How do stock options work?",
  ],
  teacher: [
    "What is the zone of proximal development?",
    "How does spaced repetition improve learning?",
    "What makes a good explanation stick?",
    "How do different learning styles affect retention?",
  ],
  writer: [
    "How does storytelling affect the brain?",
    "What makes dialogue feel natural?",
    "How do narrative structures work?",
    "What is the hero's journey?",
  ],
  electronics: [
    "How does a MOSFET work?",
    "What is the difference between analog and digital signals?",
    "How does an oscilloscope measure signals?",
    "What is the role of capacitors in circuits?",
    "How does signal modulation work?",
  ],
};

const INTEREST_SUGGESTIONS: Record<string, string[]> = {
  Science: ["What is dark matter?", "How does evolution actually work?", "What is CRISPR?"],
  Technology: ["How do quantum computers differ from regular ones?", "What is Web3?", "How does 5G work?"],
  Music: [
    "How does Spotify's algorithm know what I'll like?",
    "Why do some songs get stuck in our heads?",
    "How does autotune actually change a voice?",
    "Why does music give us chills?",
    "How are hit songs engineered to be catchy?",
    "What makes a song sound 'nostalgic'?",
  ],
  Art: ["What made the Renaissance so special?", "How does perspective work in painting?", "Why is the Mona Lisa so famous?"],
  Philosophy: ["What is the trolley problem really asking?", "What did Nietzsche mean by 'God is dead'?", "What is existentialism?"],
  Psychology: ["What is cognitive dissonance?", "How does the placebo effect work?", "Why do we procrastinate?"],
  Finance: ["How does cryptocurrency mining work?", "What causes recessions?", "How does inflation affect savings?"],
  History: ["What caused the fall of the Roman Empire?", "How did the printing press change the world?"],
  Mathematics: ["What is calculus actually used for?", "Why is pi irrational?", "What is the Fibonacci sequence about?"],
  Health: ["How does intermittent fasting affect the body?", "What happens during REM sleep?"],
  Gaming: ["How does ray tracing work?", "What makes game physics realistic?", "How do game engines render 3D worlds?"],
  Engineering: ["How do bridges support so much weight?", "What is signal processing?", "How do electric motors work?"],
  Astronomy: ["How do black holes form?", "What is the Big Bang theory?", "How far away is the nearest star?"],
  Nature: ["How do birds navigate during migration?", "What causes the Northern Lights?"],
  Cooking: ["What is the Maillard reaction?", "Why does salt enhance flavor?", "How does fermentation work?"],
  Sports: ["How does muscle memory work?", "What is VO2 max?"],
  Movies: ["How do CGI effects look so real?", "What makes a plot twist effective?"],
  Literature: ["What is magical realism?", "How do unreliable narrators work?"],
  Medicine: ["How does mRNA technology work?", "What is the lymphatic system?"],
  Business: ["What is product-market fit?", "How does venture capital work?"],
  Design: ["What is the golden ratio?", "How does UX differ from UI?"],
  Travel: ["How do airplanes actually stay in the air?", "What causes jet lag?"],
  Politics: ["How does gerrymandering work?", "What is the electoral college?"],
};

function getPersonalizedSuggestions(profile: UserProfile): string[] {
  const suggestions: string[] = [];
  const roleLower = profile.role.toLowerCase();
  for (const [key, items] of Object.entries(ROLE_SUGGESTIONS)) {
    if (roleLower.includes(key)) suggestions.push(...items);
  }
  for (const interest of profile.interests) {
    const items = INTEREST_SUGGESTIONS[interest];
    if (items) suggestions.push(...items);
  }
  return [...new Set(suggestions)];
}

function shuffleRandom(arr: string[]): string[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const FALLBACK_SUGGESTIONS = [
  "How does the stock market actually work?",
  "What is quantum computing?",
  "Why do we dream?",
  "How does the immune system fight viruses?",
  "What causes inflation?",
  "How does machine learning work?",
  "What is game theory?",
  "How does blockchain work?",
];

const PLACEHOLDERS = [
  "e.g. Why do we dream?",
  "e.g. How does gravity work?",
  "e.g. What is dark matter?",
  "e.g. How does DNA work?",
  "e.g. What causes inflation?",
  "e.g. How do vaccines work?",
  "e.g. What is game theory?",
  "e.g. How do black holes form?",
  "e.g. Why is the sky blue?",
  "e.g. What is blockchain?",
];

export default function TopicInput({ onSubmit, isLoading, userName, profile }: Props) {
  const [topic, setTopic] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!profile) return;
    const personalized = getPersonalizedSuggestions(profile);
    const pool = personalized.length > 0 ? personalized : [...FALLBACK_SUGGESTIONS];
    const shuffled = shuffleRandom(pool);
    setSuggestions(shuffled.slice(0, 4));
  }, [profile?.id, profile?.role, profile?.interests?.join(",")]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const adjustTextarea = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 220);
    el.style.height = `${nextHeight}px`;
    setIsExpanded(nextHeight > 56);
  };

  const handleSubmit = () => {
    if (topic.trim() && !isLoading) onSubmit(topic.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showSuggestions = !isLoading && topic.length === 0 && suggestions.length > 0;
  const firstName = userName ? userName.split(" ")[0] : "";

  return (
    <div className="animate-fade-up pt-4 sm:pt-8 md:pt-16 max-w-2xl">
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/8 border border-accent/15 mb-4">
          <Icon name="compass" className="w-4 h-4 text-accent" />
          <span className="font-pixel text-accent uppercase tracking-wider">explore</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-[1.85rem] font-bold tracking-tight leading-snug mb-1">
          {firstName ? (
            <>What are you curious about, <span className="text-accent">{firstName}</span>?</>
          ) : (
            "What would you like to learn?"
          )}
        </h1>
        <p className="text-text-muted text-[14px] mt-2 leading-relaxed">
          Type any topic and get an explanation shaped to how you think.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-accent/10 via-transparent to-gold/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="relative surface-card p-2.5 sm:p-3 rounded-2xl">
          <div className={`flex ${isExpanded ? "flex-col items-stretch gap-2.5" : "items-end gap-2"}`}>
            <textarea
              ref={inputRef}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                requestAnimationFrame(adjustTextarea);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="w-full bg-transparent px-2.5 py-2.5 text-[15px] text-text placeholder:text-text-dim focus:outline-none resize-none transition-all duration-200 overflow-y-auto"
              disabled={isLoading}
            />
            <div className={`flex items-center gap-2 ${isExpanded ? "self-end" : "shrink-0"}`}>
              <span className="text-text-dim hidden md:block select-none font-pixel">
                ENTER
              </span>
              <button
                onClick={handleSubmit}
                disabled={!topic.trim() || isLoading}
                className="btn-tactile focus-ring h-10 w-10 rounded-xl bg-accent hover:bg-accent-hover text-[#131210] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                aria-label="Submit topic"
              >
                {isLoading ? <LoadingSpinner /> : <ArrowUpIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuggestions && (
        <div className="mt-6 stagger-in">
          <p className="font-pixel text-text-dim mb-3 uppercase tracking-wider flex items-center gap-2">
            <SparkleIcon className="w-3 h-3 text-gold" />
            try one of these
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  setTopic(s);
                  inputRef.current?.focus();
                  inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  requestAnimationFrame(adjustTextarea);
                }}
                style={{ animationDelay: `${i * 50}ms` }}
                className="hover-lift animate-fade-up px-3.5 py-2 rounded-xl text-[12px] border border-border text-text-muted hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-colors duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="zensei-loader w-4 h-4 text-current" viewBox="0 0 50 30" fill="none">
      <path className="trace" d="M25 15c-4-6.5-10-10-15-10S2 8.5 2 15s3 10 8 10 11-3.5 15-10c4-6.5 10-10 15-10s8 3.5 8 10-3 10-8 10-11-3.5-15-10Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c0-4.5-4-6.5-7-5.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c0-4.5 4-6.5 7-5.5" />
    </svg>
  );
}

function ArrowUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5m0 0L6.75 9.75M12 4.5l5.25 5.25" />
    </svg>
  );
}

function SparkleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  );
}
