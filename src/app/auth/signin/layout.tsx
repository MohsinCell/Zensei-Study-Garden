import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Zensei study garden and pick up where you left off.",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
