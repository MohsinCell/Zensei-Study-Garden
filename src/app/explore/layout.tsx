import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Pick any topic and get a personalized explanation shaped to how you think. Go deeper, simplify, or ask follow-ups.",
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
