"use client";

import { useState, useEffect } from "react";

const CUTE_MESSAGES = [
  "Watering the knowledge garden...",
  "Planting seeds of wisdom...",
  "Growing your brain cells...",
  "Summoning the study spirits...",
  "Brewing some brain juice...",
  "Feeding the curiosity monster...",
  "Stretching neural pathways...",
  "Polishing your thinking cap...",
  "Charging brain batteries...",
  "Waking up the wise owls...",
  "Sharpening pencils of fate...",
  "Consulting the scroll keepers...",
  "Harvesting fresh insights...",
  "Tuning the learning frequency...",
  "Warming up the idea engine...",
  "Gathering stardust thoughts...",
  "Unfurling the map of knowledge...",
  "Lighting the lantern of learning...",
  "Dusting off ancient wisdom...",
  "Mixing potions of understanding...",
];

function getRandomMessage(): string {
  return CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)];
}

interface LoaderProps {
  /** Size of the loader icon */
  size?: "sm" | "md" | "lg";
  /** Show cute message below loader */
  showMessage?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Color class for the loader */
  color?: string;
}

const SIZES = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export default function Loader({
  size = "md",
  showMessage = true,
  className = "",
  color = "text-accent"
}: LoaderProps) {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setMessage(getRandomMessage());
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        className={`zensei-loader ${SIZES[size]} ${color}`}
        viewBox="0 0 50 30"
        fill="none"
      >
        <path
          className="trace"
          d="M25 15c-4-6.5-10-10-15-10S2 8.5 2 15s3 10 8 10 11-3.5 15-10c4-6.5 10-10 15-10s8 3.5 8 10-3 10-8 10-11-3.5-15-10Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {showMessage && message && (
        <span className="text-[11px] font-pixel text-text-dim uppercase tracking-widest text-center">
          {message}
        </span>
      )}
    </div>
  );
}

/** Inline loader for buttons - no message, just the icon */
export function InlineLoader({ className = "", text }: { className?: string; text?: string }) {
  return (
    <span className={`flex items-center justify-center gap-2 ${className}`}>
      <svg className="zensei-loader w-5 h-5" viewBox="0 0 50 30" fill="none">
        <path
          className="trace"
          d="M25 15c-4-6.5-10-10-15-10S2 8.5 2 15s3 10 8 10 11-3.5 15-10c4-6.5 10-10 15-10s8 3.5 8 10-3 10-8 10-11-3.5-15-10Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {text}
    </span>
  );
}
