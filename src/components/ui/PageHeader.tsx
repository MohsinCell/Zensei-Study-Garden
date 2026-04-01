import Icon from "@/components/ui/Icon";

interface Props {
  badge: string;
  badgeIcon: string;
  badgeColor?: "accent" | "gold" | "ember";
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const colorMap = {
  accent: {
    bg: "bg-accent/8",
    border: "border-accent/15",
    text: "text-accent",
  },
  gold: {
    bg: "bg-gold/8",
    border: "border-gold/15",
    text: "text-gold",
  },
  ember: {
    bg: "bg-ember/8",
    border: "border-ember/15",
    text: "text-ember",
  },
};

export default function PageHeader({ badge, badgeIcon, badgeColor = "accent", title, subtitle, action }: Props) {
  const c = colorMap[badgeColor];
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${c.bg} border ${c.border} mb-4`}>
            <Icon name={badgeIcon} className={`w-3.5 h-3.5 ${c.text}`} />
            <span className={`font-pixel ${c.text} uppercase tracking-wider`}>{badge}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight mb-1">{title}</h1>
          {subtitle && (
            <p className="text-text-muted text-[14px] leading-relaxed">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0 pt-8">{action}</div>}
      </div>
    </div>
  );
}
