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
      <div className="w-14 h-14 rounded-full bg-white border border-default shadow-sm flex items-center justify-center active:bg-gray-50 transition-colors">
        <Icon size={22} className="text-accent-app" />
      </div>
      <span className="text-[11px] font-medium text-secondary">{label}</span>
    </button>
  );
}
