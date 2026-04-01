"use client";

import { useState } from "react";
import { DepthPreference, PurposeIntent } from "@/lib/types";
import Icon from "@/components/ui/Icon";

interface Props {
  topic: string;
  onConfirm: (depth: DepthPreference, purpose: PurposeIntent) => void;
  onCancel: () => void;
}

export default function IntentDialog({ topic, onConfirm, onCancel }: Props) {
  const [depth, setDepth] = useState<DepthPreference>("detailed");
  const [purpose, setPurpose] = useState<PurposeIntent>("curiosity");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div
        className="bg-bg-card border border-border rounded-2xl p-5 sm:p-7 w-full max-w-md max-h-[85vh] overflow-y-auto space-y-5 sm:space-y-6 animate-fade-in-scale shadow-elevated"
        role="dialog"
        aria-labelledby="intent-dialog-title"
        aria-modal="true"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-accent/8 border border-accent/15 mb-3">
            <Icon name="cog" className="w-3 h-3 text-accent" />
            <span className="font-pixel text-accent uppercase tracking-widest">configure</span>
          </div>
          <h2 id="intent-dialog-title" className="text-lg font-bold tracking-tight mb-1.5">How would you like this?</h2>
          <p className="text-text-muted text-[13px] leading-relaxed line-clamp-2">
            &ldquo;{topic}&rdquo;
          </p>
        </div>

        <div>
          <label className="block text-[12px] text-text-muted font-semibold mb-2.5 uppercase tracking-wider">Depth</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <DepthCard
              selected={depth === "brief"}
              onClick={() => setDepth("brief")}
              icon="speed-lines"
              title="Quick Look"
              description="Just the essentials"
              accentColor="accent"
              badge="2-3 min"
            />
            <DepthCard
              selected={depth === "detailed"}
              onClick={() => setDepth("detailed")}
              icon="layers"
              title="Full Exploration"
              description="Thorough with detail"
              accentColor="accent"
              badge="5-10 min"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] text-text-muted font-semibold mb-2.5 uppercase tracking-wider">Purpose</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <DepthCard
              selected={purpose === "curiosity"}
              onClick={() => setPurpose("curiosity")}
              icon="light-spark"
              title="Curiosity"
              description="I want to understand"
              accentColor="gold"
              badge="engaging"
            />
            <DepthCard
              selected={purpose === "exam"}
              onClick={() => setPurpose("exam")}
              icon="graduation-cap"
              title="Study Mode"
              description="I need to remember this"
              accentColor="gold"
              badge="structured"
            />
          </div>
        </div>

        <div className="surface-inset p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon name="sparkle" className="w-3 h-3 text-accent" />
            <span className="font-pixel text-accent uppercase tracking-wider">preview</span>
          </div>
          <p className="text-text-muted text-[13px] leading-relaxed">
            {depth === "brief" && purpose === "curiosity" && "A short, clear summary with a helpful analogy. Good for a quick read."}
            {depth === "brief" && purpose === "exam" && "A concise overview with key terms and memory aids. Study-ready in minutes."}
            {depth === "detailed" && purpose === "curiosity" && "A thorough explanation with analogies, deeper insights, and real-world connections."}
            {depth === "detailed" && purpose === "exam" && "A structured study guide with key terms highlighted and exam-ready formatting."}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-1">
          <button onClick={onCancel} className="btn-ghost btn-tactile flex-1 py-3">
            Cancel
          </button>
          <button onClick={() => onConfirm(depth, purpose)} className="btn-primary btn-tactile flex-1 py-3">
            <Icon name="sprout" className="w-4 h-4" />
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

function DepthCard({
  selected,
  onClick,
  icon,
  title,
  description,
  accentColor,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  description: string;
  accentColor: "accent" | "gold";
  badge: string;
}) {
  const selectedBg = accentColor === "accent"
    ? "bg-accent/10 border-accent/30 ring-1 ring-accent/10"
    : "bg-gold/10 border-gold/30 ring-1 ring-gold/10";
  const iconColor = accentColor === "accent"
    ? (selected ? "text-accent bg-accent/15" : "text-text-dim bg-bg-elevated")
    : (selected ? "text-gold bg-gold/15" : "text-text-dim bg-bg-elevated");
  const titleColor = accentColor === "accent"
    ? (selected ? "text-accent" : "text-text")
    : (selected ? "text-gold" : "text-text");

  return (
    <button onClick={onClick}
      className={`btn-tactile focus-ring px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${
        selected ? selectedBg : "border-border hover:border-text-dim hover:bg-bg-hover"
      }`}>
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${iconColor}`}>
          <Icon name={icon} className="w-3.5 h-3.5" />
        </div>
        <span className={`font-semibold text-[13px] ${titleColor}`}>{title}</span>
      </div>
      <div className="text-text-dim text-[12px] mb-2">{description}</div>
      <div className={`inline-block font-pixel px-2 py-0.5 rounded-md uppercase tracking-wider ${
        selected
          ? (accentColor === "accent" ? "bg-accent/10 text-accent" : "bg-gold/10 text-gold")
          : "bg-bg-elevated text-text-dim"
      }`}>
        {badge}
      </div>
    </button>
  );
}
