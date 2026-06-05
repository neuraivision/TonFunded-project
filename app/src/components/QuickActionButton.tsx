import type { LucideIcon } from 'lucide-react';

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
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{
          background: accent ? 'rgba(77,184,255,0.1)' : 'var(--bg-sunken)',
          border: `1px solid ${accent ? 'rgba(77,184,255,0.22)' : 'var(--line)'}`,
        }}
      >
        <Icon
          size={19}
          style={{ color: accent ? 'var(--ton)' : 'var(--ink-2)' }}
          strokeWidth={1.7}
        />
      </div>
      <span className="text-[10px] leading-none" style={{ color: 'var(--ink-3)', fontWeight: 500 }}>
        {label}
      </span>
    </button>
  );
}
