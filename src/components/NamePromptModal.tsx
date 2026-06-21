// Shown once after wallet/Telegram auth if users.name is null.
// The user can dismiss it (name stays null) but we prompt politely.
import { useState } from 'react';
import { supabase } from '@/lib/tonfunded';

interface Props {
  onDone: (name: string | null) => void;
}

export default function NamePromptModal({ onDone }: Props) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) { onDone(null); return; }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('users').update({ name: trimmed }).eq('id', session.user.id);
      }
      onDone(trimmed);
    } catch {
      onDone(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 pb-8 px-4 sm:items-center sm:pb-0">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1520] p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-bold text-white">What should we call you?</h3>
        <p className="mb-5 text-sm text-slate-400">Used in leaderboards and your profile. You can change it later.</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="Your display name"
          className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#4DB8FF]/40 focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            onClick={() => onDone(null)}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:text-white"
          >
            Skip
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#4DB8FF] to-[#2AA8F2] py-2.5 text-sm font-bold text-[#03111E] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
