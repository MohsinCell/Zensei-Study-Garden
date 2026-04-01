export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ratingLabel(rating: number | null): string {
  if (rating === null) return "Not rated";
  if (rating <= 1) return "Didn't click";
  if (rating <= 2) return "Somewhat confused";
  if (rating <= 3) return "Getting there";
  if (rating <= 4) return "Makes sense";
  return "Crystal clear";
}

export function ratingColor(rating: number | null): string {
  if (rating === null) return "text-text-dim";
  if (rating <= 2) return "text-warning";
  if (rating <= 3) return "text-text-muted";
  return "text-success";
}
