import { type LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export default function QuickActionButton({ icon: Icon, label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 select-none"
    >
      <div className="w-14 h-14 rounded-full border border-default flex items-center justify-center active:opacity-80 transition-opacity" style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-sm)" }}>
        <Icon size={22} className="text-accent-app" />
      </div>
      <span className="text-[11px] font-medium text-secondary">{label}</span>
    </button>
  );
}
