import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Your learning journal. Review past topics, ratings, and explanations. See what you've mastered and what needs another look.",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
