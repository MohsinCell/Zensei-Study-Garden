"use client";

interface Props {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const widths = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
};

export default function PageShell({ children, maxWidth = "md" }: Props) {
  return (
    <div className={`${widths[maxWidth]} mx-auto px-4 sm:px-5 md:px-10 pt-16 pb-6 sm:pt-8 sm:pb-8 md:pt-12 md:pb-12 animate-page-in`}>
      {children}
    </div>
  );
}
