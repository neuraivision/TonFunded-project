import { useEffect, useRef, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { supabase, loginWithTonConnect } from '@/lib/tonfunded';

type Phase =
  | 'checking'        // pinging extension + checking session
  | 'needs-login'     // no session — instruct user to sign in on TonFunded first
  | 'wallet-open'     // TON Connect modal open
  | 'linking'         // session found, messaging the extension
  | 'connected'       // all done ✓
  | 'error';

const BG    = '#090E17';
const BLUE  = '#4DB8FF';
const BLUE2 = '#2AA8F2';
const TEXT  = '#E8EEF8';
const DIM   = '#7D8FA5';
const SURF  = '#111720';

function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid rgba(77,184,255,.15)',
        borderTopColor: BLUE,
        animation: 'tf-spin .8s linear infinite',
      }} />
      {label && <p style={{ color: DIM, fontSize: 14, margin: 0 }}>{label}</p>}
    </div>
  );
}

function Btn({ children, onClick, secondary }: { children: React.ReactNode; onClick?: () => void; secondary?: boolean }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '14px', borderRadius: 14, border: secondary ? '1px solid rgba(255,255,255,.1)' : 'none',
      cursor: 'pointer',
      background: secondary ? 'rgba(255,255,255,.06)' : `linear-gradient(90deg,${BLUE} 0%,${BLUE2} 100%)`,
      color: secondary ? DIM : '#03111E', fontSize: 14, fontWeight: secondary ? 600 : 800,
    }}>
      {children}
    </button>
  );
}

export default function ExtensionAuth() {
  const [tonConnectUI] = useTonConnectUI();
  const [phase, setPhase]   = useState<Phase>('checking');
  const [errMsg, setErrMsg] = useState('');
  const ran = useRef(false);

  const params = new URLSearchParams(window.location.search);
  const extId  = params.get('ext') || '';

  // ── wake + ping extension (MV3 workers go dormant) ─────────────────────
  function ping(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const cr = (window as any).chrome;
        if (!extId || !cr?.runtime?.sendMessage) { resolve(false); return; }
        // Wake-up ping
        cr.runtime.sendMessage(extId, { type: 'PING' }, (r: any) => {
          void (window as any).chrome?.runtime?.lastError;
          resolve(!!(r && r.ok));
        });
        setTimeout(() => resolve(false), 3000); // 3s timeout
      } catch { resolve(false); }
    });
  }

  // ── send the actual auth handshake ──────────────────────────────────────
  async function handshake(session: any) {
    setPhase('linking');

    const alive = await ping();
    if (!alive) {
      setErrMsg(
        extId
          ? 'Could not reach the Ton Tap extension.\nMake sure it is installed, enabled, then try again.'
          : 'No extension ID in the URL — please click "Sign In to Ton Tap" from the extension popup again.'
      );
      setPhase('error');
      return;
    }

    const walletAddress =
      tonConnectUI.wallet?.account?.address ||
      (session.user.user_metadata as any)?.address ||
      '';

    const cr = (window as any).chrome;
    cr.runtime.sendMessage(
      extId,
      {
        type:    'TONTAP_AUTH',
        token:   session.access_token,
        method:  session.user.app_metadata?.provider || 'wallet',
        email:   session.user.email || '',
        address: walletAddress,
      },
      (res: { ok?: boolean } | undefined) => {
        const err = (window as any).chrome?.runtime?.lastError;
        if (err || !res?.ok) {
          setErrMsg('Extension rejected the session — ' + (err?.message || 'unknown error') + '. Reload and try again.');
          setPhase('error');
          return;
        }
        setPhase('connected');
      }
    );
  }

  // ── on mount: check session, then handshake or guide user ───────────────
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handshake(session);
        } else {
          setPhase('needs-login');
        }
      } catch {
        setPhase('needs-login');
      }
    })();
  }, []);

  // ── wallet connect flow (for users without a session) ──────────────────
  async function connectWallet() {
    setPhase('wallet-open');
    try {
      await loginWithTonConnect(tonConnectUI);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session was not established after wallet connect');
      await handshake(session);
    } catch (e: any) {
      setErrMsg(e?.message || 'Wallet connection failed — please try again.');
      setPhase('error');
    }
  }

  // ── re-check session (for users who just signed in on main app) ─────────
  async function retryWithSession() {
    setPhase('checking');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handshake(session);
      } else {
        setPhase('needs-login');
      }
    } catch {
      setPhase('needs-login');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: BG, fontFamily: '-apple-system,"SF Pro Text","Segoe UI",Roboto,sans-serif',
    }}>
      <img src="/logo.png" alt="TonFunded" style={{ height: 34, marginBottom: 36, opacity: .92 }} />

      <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>

        {/* ── checking / linking ── */}
        {(phase === 'checking' || phase === 'linking') && (
          <Spinner label={phase === 'checking' ? 'Checking your account…' : 'Linking to Ton Tap…'} />
        )}

        {/* ── wallet modal open ── */}
        {phase === 'wallet-open' && <Spinner label="Waiting for wallet…" />}

        {/* ── needs login ── */}
        {phase === 'needs-login' && <>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(77,184,255,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke={BLUE} strokeWidth="1.8"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ color: TEXT, fontSize: 20, fontWeight: 700, margin: 0 }}>Sign in first</h2>
          <p style={{ color: DIM, fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>
            Open TonFunded and sign in with your wallet, then come back here and tap <strong style={{ color: TEXT }}>I've signed in</strong> below.
          </p>

          {/* Two-step approach */}
          <div style={{
            width: '100%', background: SURF, borderRadius: 14,
            border: '1px solid rgba(77,184,255,.1)',
            padding: '14px 16px', textAlign: 'left',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <Step n={1} text="Open TonFunded and sign in with your TON wallet" />
            <Step n={2} text="Come back to this tab and tap the button below" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
            <Btn onClick={retryWithSession}>I've signed in</Btn>
            <Btn secondary onClick={() => window.open('https://app.tonfunded.xyz', '_blank')}>Open TonFunded</Btn>
            <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 8, width: '100%' }}>
              <p style={{ color: DIM, fontSize: 12, margin: '0 0 8px' }}>Or connect your wallet directly:</p>
              <Btn secondary onClick={connectWallet}>Connect Wallet</Btn>
            </div>
          </div>
        </>}

        {/* ── connected ✓ ── */}
        {phase === 'connected' && <>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 36px rgba(77,184,255,.38)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#03111E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: TEXT, fontSize: 26, fontWeight: 800, letterSpacing: '-.3px', margin: 0 }}>Connected!</h1>
          <p style={{ color: DIM, fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            Your TonFunded account is now linked to the extension.<br/>You can close this tab.
          </p>
          <Btn onClick={() => window.close()}>Close Tab</Btn>
        </>}

        {/* ── error ── */}
        {phase === 'error' && <>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(248,113,113,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#f87171" strokeWidth="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ color: TEXT, fontSize: 20, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
          <p style={{ color: DIM, fontSize: 13, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>{errMsg}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
            <Btn onClick={retryWithSession}>Try Again</Btn>
            <Btn secondary onClick={() => window.close()}>Close Tab</Btn>
          </div>
        </>}
      </div>

      <p style={{ marginTop: 48, color: '#1E2D42', fontSize: 12 }}>© TonFunded {new Date().getFullYear()}</p>

      <style>{`
        @keyframes tf-spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg,${BLUE},${BLUE2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 800, color: '#03111E',
      }}>{n}</div>
      <span style={{ color: '#7D8FA5', fontSize: 13, lineHeight: 1.5, paddingTop: 2 }}>{text}</span>
    </div>
  );
}
