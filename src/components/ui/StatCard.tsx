import Icon from "@/components/ui/Icon";

interface Props {
  iconName: string;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export default function StatCard({ iconName, label, value, sub, color = "text-text" }: Props) {
  return (
    <div className="surface-card p-3 sm:p-4 text-center group">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-bg-elevated flex items-center justify-center mx-auto mb-1.5 sm:mb-2">
        <Icon name={iconName} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary" />
      </div>
      <div className={`text-base sm:text-lg font-bold tracking-tight ${color}`}>{value}</div>
      <div className="font-pixel text-text-dim uppercase mt-0.5 w-full text-center break-words">{label}</div>
      {sub && <div className="text-[10px] sm:text-[11px] text-text-dim mt-0.5">{sub}</div>}
    </div>
  );
}
