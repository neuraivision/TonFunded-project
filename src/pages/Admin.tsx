import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, TrendingUp, Layers, DollarSign, ShieldCheck, Lock,
  ArrowLeft, ExternalLink, Loader2, RefreshCw,
} from 'lucide-react';
import { getMyRole, getAdminData } from '@/lib/tonfunded';

const SUPABASE_PROJECT = 'hcmqopgjybwvuehrchvk';
const SQL_EDITOR = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT}/sql/new`;

const fmtUsd = (n: number) =>
  '$' + (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtAddr = (a?: string | null) =>
  a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '—';
const fmtHash = (h?: string | null) =>
  h ? `${h.slice(0, 6)}…${h.slice(-6)}` : '—';
const fmtDate = (d: string) =>
  new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_COLOR: Record<string, string> = {
  verified: '#34D399', pending: '#FBBF24', failed: '#F87171', expired: '#8A99A8',
};

type AdminData = Awaited<ReturnType<typeof getAdminData>>;

export default function Admin() {
  const navigate = useNavigate();
  const [state, setState] = useState<'loading' | 'denied' | 'ready'>('loading');
  const [data, setData] = useState<AdminData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const role = await getMyRole();
      if (role !== 'admin') { setState('denied'); return; }
      setData(await getAdminData());
      setState('ready');
    } catch {
      setState('denied');
    }
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    try { setData(await getAdminData()); } finally { setRefreshing(false); }
  };

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-accent-app" size={28} />
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="px-4 pt-4 page-enter">
        <div className="card-base !p-6 flex flex-col items-center text-center mt-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
               style={{ background: 'rgba(239,68,68,0.1)' }}>
            <Lock size={24} className="text-red-500" />
          </div>
          <p className="text-base font-700 text-primary-app" style={{ fontWeight: 700 }}>Access restricted</p>
          <p className="text-sm text-secondary mt-1 max-w-[260px]">
            This area is for administrators only.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary mt-5 !py-2.5 !px-5 text-sm">
            Back to app
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data!.totalUsers, icon: Users, color: '#4DB8FF' },
    { label: 'Funded Traders', value: data!.fundedTraders, icon: TrendingUp, color: '#34D399' },
    { label: 'Active Challenges', value: data!.activeCount, icon: Layers, color: '#FBBF24' },
    { label: 'Total Revenue', value: fmtUsd(data!.totalRevenue), icon: DollarSign, color: '#A855F7' },
  ];

  return (
    <div className="px-4 pt-4 pb-6 page-enter space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/profile')} className="text-tertiary active:text-primary-app">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={18} className="text-accent-app" />
            <h2 className="text-xl font-700 text-primary-app" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
              Admin
            </h2>
          </div>
        </div>
        <button onClick={refresh} className="text-tertiary active:text-accent-app" aria-label="Refresh">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} className="card-base !p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                 style={{ background: `${s.color}1f`, border: `1px solid ${s.color}40` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="font-number text-2xl font-700 text-primary-app" style={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
              {s.value}
            </p>
            <p className="text-[11px] text-tertiary mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="card-base !p-4">
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-2" style={{ fontWeight: 700 }}>
          Recent Transactions
        </p>
        {data!.transactions.length === 0 ? (
          <p className="text-sm text-tertiary py-3 text-center">No transactions yet</p>
        ) : (
          <div className="space-y-1">
            {data!.transactions.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2"
                   style={{ borderBottom: '1px solid var(--border-default)' }}>
                <div className="min-w-0">
                  <p className="text-sm font-600 text-primary-app truncate" style={{ fontWeight: 600 }}>
                    {fmtUsd(Number(t.amount_usd))} <span className="text-tertiary font-400 capitalize">· {t.tier}</span>
                  </p>
                  <p className="text-[11px] text-tertiary truncate">
                    {t.users?.username || fmtAddr(t.users?.ton_address)} · {fmtDate(t.created_at)}
                  </p>
                  {t.tx_hash && (
                    <p className="text-[10px] font-number text-tertiary">tx {fmtHash(t.tx_hash)}</p>
                  )}
                </div>
                <span className="text-[11px] font-700 px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                      style={{ background: `${STATUS_COLOR[t.status] ?? '#8A99A8'}1f`, color: STATUS_COLOR[t.status] ?? '#8A99A8', fontWeight: 700 }}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active challenges */}
      <div className="card-base !p-4">
        <p className="text-[11px] font-700 text-tertiary uppercase tracking-widest mb-2" style={{ fontWeight: 700 }}>
          Active Challenges ({data!.activeChallenges.length})
        </p>
        {data!.activeChallenges.length === 0 ? (
          <p className="text-sm text-tertiary py-3 text-center">No active challenges</p>
        ) : (
          <div className="space-y-1">
            {data!.activeChallenges.map((c: any) => {
              const pnl = Number(c.current_balance) - Number(c.starting_balance);
              return (
                <div key={c.id} className="flex items-center justify-between py-2"
                     style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-600 text-primary-app capitalize truncate" style={{ fontWeight: 600 }}>
                      {c.tier} · {fmtUsd(Number(c.starting_balance))}
                    </p>
                    <p className="text-[11px] text-tertiary truncate">
                      {c.users?.username || fmtAddr(c.users?.ton_address)}
                    </p>
                  </div>
                  <span className="text-sm font-number font-700 flex-shrink-0"
                        style={{ fontWeight: 700, color: pnl >= 0 ? '#34D399' : '#F87171' }}>
                    {pnl >= 0 ? '+' : ''}{fmtUsd(pnl)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick link to SQL editor */}
      <a href={SQL_EDITOR} target="_blank" rel="noopener noreferrer"
         className="card-base !p-4 flex items-center justify-between active:opacity-80">
        <span className="text-sm font-600 text-primary-app" style={{ fontWeight: 600 }}>Open SQL Editor</span>
        <ExternalLink size={15} className="text-tertiary" />
      </a>
    </div>
  );
}
