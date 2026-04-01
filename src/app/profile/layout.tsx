import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Customize your learning profile, interests, and preferences.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
