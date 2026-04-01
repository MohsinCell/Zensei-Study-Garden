import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Zensei is a gamified study garden. Explore topics, earn XP, rank up from Seed to Elder Tree, and learn the way that fits you.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
