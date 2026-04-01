import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Zensei account and start your learning quest. Pick your style, set your goals, and begin growing.",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
