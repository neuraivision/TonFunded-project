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
      className="flex flex-col items-center gap-1.5 select-none active:opacity-60 transition-opacity"
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
        style={{
          background: accent ? 'rgba(77,184,255,0.12)' : 'var(--bg-surface)',
          border: `1px solid ${accent ? 'rgba(77,184,255,0.25)' : 'var(--border-default)'}`,
          boxShadow: accent ? '0 2px 10px rgba(77,184,255,0.18)' : 'none',
        }}
      >
        <Icon
          size={18}
          style={{ color: accent ? '#4DB8FF' : 'var(--text-secondary)' }}
          strokeWidth={1.8}
        />
      </div>
      <span
        className="text-[10px] text-center leading-tight px-0.5 min-h-[24px] flex items-center justify-center"
        style={{ fontWeight: 600, color: accent ? '#4DB8FF' : 'var(--text-secondary)' }}
      >
        {label}
      </span>
    </button>
  );
}
