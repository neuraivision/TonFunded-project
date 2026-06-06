import { type LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  /** Accent color for the icon chip. Defaults to TON blue. */
  color?: string;
  /** Primary action — fills the icon chip solid for emphasis. */
  primary?: boolean;
}

export default function QuickActionButton({ icon: Icon, label, onClick, color = '#4DB8FF', primary }: Props) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 py-3 px-1 rounded-2xl select-none active:scale-[0.97] transition-all"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-active:scale-95"
        style={{
          background: primary ? color : `${color}1f`,
          border: `1px solid ${primary ? color : `${color}40`}`,
          boxShadow: primary ? `0 3px 12px ${color}40` : 'none',
        }}
      >
        <Icon
          size={18}
          style={{ color: primary ? '#fff' : color }}
          strokeWidth={2}
        />
      </div>
      <span
        className="text-[10.5px] text-center leading-tight min-h-[24px] flex items-center justify-center"
        style={{ fontWeight: 600, color: 'var(--text-primary)' }}
      >
        {label}
      </span>
    </button>
  );
}
