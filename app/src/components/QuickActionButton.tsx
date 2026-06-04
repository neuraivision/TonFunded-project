import { type LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  accent?: boolean;
}

export default function QuickActionButton({ icon: Icon, label, onClick, accent }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 select-none active:opacity-60 transition-opacity"
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{
          background: accent ? 'rgba(77,184,255,0.1)' : 'var(--bg-surface)',
          border: `1px solid ${accent ? 'rgba(77,184,255,0.2)' : 'var(--border-default)'}`,
        }}
      >
        <Icon
          size={18}
          style={{ color: accent ? '#4DB8FF' : 'var(--text-secondary)' }}
          strokeWidth={1.7}
        />
      </div>
      <span className="text-[10px] text-tertiary leading-none" style={{ fontWeight: 500 }}>
        {label}
      </span>
    </button>
  );
}
