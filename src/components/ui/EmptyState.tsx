import Link from "next/link";

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref, actionIcon, onAction }: Props) {
  return (
    <div className="text-center py-16 sm:py-20 animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-5 rounded-2xl surface-card flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-muted text-[14px] max-w-xs mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="btn-primary btn-tactile inline-flex items-center gap-2"
        >
          {actionIcon}
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="btn-primary btn-tactile inline-flex items-center gap-2"
        >
          {actionIcon}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
