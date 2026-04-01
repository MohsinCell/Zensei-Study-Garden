"use client";

import { useState } from "react";
import { Explanation } from "@/lib/types";

interface Props {
  explanation: Explanation;
  topicId: string;
  topic: string;
  onAction: (mode: "simplified" | "deeper" | "example" | "analogy") => void;
  onFollowup: (query: string) => void;
  onRate: (rating: number) => void;
  isLoading: boolean;
  isLatest: boolean;
}

export default function ExplanationCard({
  explanation,
  onAction,
  onFollowup,
  onRate,
  isLoading,
  isLatest,
}: Props) {
  const [rated, setRated] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [followupText, setFollowupText] = useState("");
  const [copied, setCopied] = useState(false);
  const { sections } = explanation;

  const handleRate = (rating: number) => {
    setRated(true);
    onRate(rating);
  };

  const handleFollowupSubmit = () => {
    if (followupText.trim() && !isLoading) {
      onFollowup(followupText.trim());
      setFollowupText("");
    }
  };

  const handleCopy = async () => {
    const text = [
      sections.tldr && `TL;DR: ${sections.tldr}`,
      sections.core,
      sections.analogy && `Analogy: ${sections.analogy}`,
      sections.deeperDive && `Deeper Dive:\n${sections.deeperDive}`,
      sections.example && `Example:\n${sections.example}`,
    ].filter(Boolean).join("\n\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modeLabel: Record<string, string> = {
    initial: "",
    simplified: "Simplified",
    deeper: "Going Deeper",
    example: "Example",
    analogy: "New Analogy",
    followup: "Follow-up",
  };

  const ratingLabels = ["", "Lost", "Fuzzy", "Okay", "Clear", "Crystal clear"];

  return (
    <div className="animate-fade-up space-y-6">
      {explanation.type !== "initial" && (
        <div className="flex items-center gap-3 py-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/5 border border-accent/10">
            <SparkMarkIcon className="w-2.5 h-2.5 text-accent/80" />
            <span className="font-pixel text-accent uppercase tracking-widest">
              {modeLabel[explanation.type]}
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      )}

      {explanation.userQuery && (
        <div className="flex justify-end">
          <div className="bg-accent/8 border border-accent/15 rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
            <p className="text-[13px] text-text leading-relaxed">{explanation.userQuery}</p>
          </div>
        </div>
      )}

      {sections.tldr && (
        <div className="flex items-start gap-3 pl-1">
          <div className="shrink-0 mt-0.5 w-1 h-1 rounded-full bg-accent/60" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] sm:text-[15px] text-text-secondary leading-relaxed italic">
              {sections.tldr}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="btn-tactile shrink-0 text-[11px] text-text-dim hover:text-text-secondary flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-bg-hover transition-colors"
          >
            {copied ? (
              <><CheckIcon className="w-3 h-3 text-success" /><span className="text-success">Copied</span></>
            ) : (
              <><CopyIcon className="w-3 h-3" /><span>Copy</span></>
            )}
          </button>
        </div>
      )}

      <div className="explanation-content text-[14px] sm:text-[15px] leading-[1.85] break-words">
        <div dangerouslySetInnerHTML={{ __html: markdownToHtml(sections.core) }} />
      </div>

      {sections.analogy && (
        <div className="rounded-xl border border-gold/15 bg-gold/[0.04] p-4 sm:p-5 relative overflow-hidden break-words">
          <div className="absolute top-0 left-0 w-0.5 h-full bg-gold/40" />
          <div className="flex items-center gap-2 mb-3 pl-1.5">
            <LightbulbIcon className="w-3.5 h-3.5 text-gold" />
            <span className="font-pixel text-gold uppercase tracking-widest">think of it as</span>
          </div>
          <div className="explanation-content text-[13px] sm:text-[14px] leading-[1.85] pl-1.5"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(sections.analogy) }} />
        </div>
      )}

      {sections.deeperDive && (
        <div className="rounded-xl border border-accent/15 bg-accent/[0.04] p-4 sm:p-5 relative overflow-hidden break-words">
          <div className="absolute top-0 left-0 w-0.5 h-full bg-accent/40" />
          <div className="flex items-center gap-2 mb-3 pl-1.5">
            <PickaxeIcon className="w-3.5 h-3.5 text-accent" />
            <span className="font-pixel text-accent uppercase tracking-widest">going deeper</span>
          </div>
          <div className="explanation-content text-[13px] sm:text-[14px] leading-[1.85] pl-1.5"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(sections.deeperDive) }} />
        </div>
      )}

      {sections.example && (
        <div className="rounded-xl border border-gold/15 bg-gold/[0.04] p-4 sm:p-5 relative overflow-hidden break-words">
          <div className="absolute top-0 left-0 w-0.5 h-full bg-gold/40" />
          <div className="flex items-center gap-2 mb-3 pl-1.5">
            <FlaskIcon className="w-3.5 h-3.5 text-gold" />
            <span className="font-pixel text-gold uppercase tracking-widest">example</span>
          </div>
          <div className="explanation-content text-[13px] sm:text-[14px] leading-[1.85] pl-1.5"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(sections.example) }} />
        </div>
      )}

      {isLatest && !isLoading && (
        <div className="space-y-4 pt-2">

          <div className="flex flex-wrap gap-2 stagger-in">
            <ActionButton onClick={() => onAction("simplified")} disabled={isLoading}
              icon={<SimplifyIcon />} label="Simplify" />
            <ActionButton onClick={() => onAction("deeper")} disabled={isLoading}
              icon={<PickaxeSmallIcon />} label="Go Deeper" />
            <ActionButton onClick={() => onAction("example")} disabled={isLoading}
              icon={<FlaskSmallIcon />} label="Example" />
            <ActionButton onClick={() => onAction("analogy")} disabled={isLoading}
              icon={<ShuffleIcon />} label="New Analogy" />
          </div>

          <div className="relative">
            <input
              type="text"
              value={followupText}
              onChange={(e) => setFollowupText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFollowupSubmit();
                }
              }}
              placeholder="Ask a follow-up..."
              disabled={isLoading}
              className="input-field focus-ring pr-20 text-[13px]"
            />
            <button
              onClick={handleFollowupSubmit}
              disabled={!followupText.trim() || isLoading}
              className="btn-tactile absolute right-2.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-[#131210] rounded-lg text-[12px] font-semibold disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              Ask
            </button>
          </div>

          {!rated ? (
            <div className="flex items-center gap-4 pt-1">
              <span className="text-[11px] text-text-dim font-medium">Did it click?</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRate(r)}
                    onMouseEnter={() => setHoveredRating(r)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className={`btn-tactile focus-ring relative w-8 h-8 rounded-lg text-[12px] font-semibold border transition-all duration-150 ${
                      hoveredRating >= r
                        ? "bg-accent/15 border-accent/40 text-accent"
                        : "border-border text-text-dim hover:text-text-muted hover:border-text-dim"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {hoveredRating > 0 && (
                <span className="font-pixel text-accent uppercase tracking-wider animate-fade-up">
                  {ratingLabels[hoveredRating]}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1 animate-fade-up">
              <SproutSmallIcon className="w-4 h-4 text-accent animate-sprout" />
              <p className="text-[12px] text-accent font-medium">Thanks for the feedback!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionButton({ onClick, disabled, icon, label }: {
  onClick: () => void; disabled: boolean; icon: React.ReactNode; label: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="btn-tactile hover-lift focus-ring relative group flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border text-[12px] font-medium hover:border-accent/30 hover:bg-accent/5 hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors duration-150">
      <span className="text-text-dim group-hover:text-accent/70 transition-colors">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Icons ──

function ScrollIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
function SparkMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2 13.4 8.6 20 10l-6.6 1.4L12 18l-1.4-6.6L4 10l6.6-1.4L12 2Z" />
    </svg>
  );
}
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}
function PickaxeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}
function FlaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}
function SproutSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c0-4.5-4-6.5-7-5.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c0-4.5 4-6.5 7-5.5" />
    </svg>
  );
}

function SimplifyIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>;
}
function PickaxeSmallIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>;
}
function FlaskSmallIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>;
}
function ShuffleIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>;
}

// ── Markdown ──
function markdownToHtml(text: string): string {
  if (!text) return "";
  // Safety: if text looks like raw JSON, try to extract the core content
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.includes('"core"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.core) return markdownToHtml(parsed.core);
    } catch {
      // Try to extract core field from partial JSON
      const match = trimmed.match(/"core"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (match) {
        const extracted = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        return markdownToHtml(extracted);
      }
    }
  }
  const lines = text.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  const listStack: Array<{ type: "ul" | "ol"; indent: number }> = [];

  function closeListsTo(targetIndent: number) {
    while (listStack.length > 0 && listStack[listStack.length - 1].indent >= targetIndent) {
      const popped = listStack.pop()!;
      result.push(`</${popped.type}>`);
    }
  }

  function closeAllLists() {
    while (listStack.length > 0) {
      const popped = listStack.pop()!;
      result.push(`</${popped.type}>`);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        closeAllLists();
        inCodeBlock = true;
        codeBuffer = [];
        continue;
      } else {
        inCodeBlock = false;
        result.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
        continue;
      }
    }
    if (inCodeBlock) { codeBuffer.push(line); continue; }

    const ulMatch = line.match(/^(\s*)[*-] (.+)$/);
    const olMatch = line.match(/^(\s*)(\d+)\. (.+)$/);

    if (ulMatch) {
      const indent = ulMatch[1].length;
      const content = ulMatch[2];
      const currentDepth = listStack.length > 0 ? listStack[listStack.length - 1].indent : -1;

      if (listStack.length === 0 || indent > currentDepth) {
        listStack.push({ type: "ul", indent });
        result.push("<ul>");
      } else if (indent < currentDepth) {
        closeListsTo(indent + 1);
      }
      result.push(`<li>${fmt(content)}</li>`);
    } else if (olMatch) {
      const indent = olMatch[1].length;
      const num = parseInt(olMatch[2], 10);
      const content = olMatch[3];
      const currentDepth = listStack.length > 0 ? listStack[listStack.length - 1].indent : -1;

      if (listStack.length === 0 || indent > currentDepth) {
        listStack.push({ type: "ol", indent });
        result.push(`<ol start="${num}">`);
      } else if (indent < currentDepth) {
        closeListsTo(indent + 1);
      }
      result.push(`<li value="${num}">${fmt(content)}</li>`);
    } else {
      // Don't close lists on blank lines - preserves numbering when AI
      // inserts blank lines between list items
      if (line.trim() === "" && listStack.length > 0) {
        continue;
      }

      closeAllLists();

      if (line.match(/^### (.+)$/)) {
        result.push(`<h3>${fmt(line.replace(/^### /, ""))}</h3>`);
      } else if (line.match(/^## (.+)$/)) {
        result.push(`<h2>${fmt(line.replace(/^## /, ""))}</h2>`);
      } else if (line.match(/^# (.+)$/)) {
        result.push(`<h1>${fmt(line.replace(/^# /, ""))}</h1>`);
      } else if (line.match(/^> (.+)$/)) {
        result.push(`<blockquote>${fmt(line.replace(/^> /, ""))}</blockquote>`);
      } else if (line.trim() === "") {
        result.push("</p><p>");
      } else {
        result.push(fmt(line));
      }
    }
  }

  closeAllLists();
  if (inCodeBlock) {
    result.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
  }

  let html = `<p>${result.join("\n")}</p>`;
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>\s*<(ul|ol|h[1-3]|pre|blockquote)/g, "<$1");
  html = html.replace(/<\/(ul|ol|h[1-3]|pre|blockquote)>\s*<\/p>/g, "</$1>");
  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}
