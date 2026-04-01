import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Track your badges, milestones, and progress. Every topic explored earns XP and brings you closer to the next rank.",
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
