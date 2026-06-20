import { useEffect, useRef, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { supabase, loginWithTonConnect } from '@/lib/tonfunded';

type Phase =
  | 'checking'      // checking existing session
  | 'needs-login'   // no session — show Connect Wallet
  | 'wallet-open'   // TON Connect modal is open
  | 'linking'       // session found, messaging the extension
  | 'connected'     // all done
  | 'error';

const BG   = '#090E17';
const SURF = '#111720';
const BLUE = '#4DB8FF';
const BLUE2= '#2AA8F2';
const TEXT = '#E8EEF8';
const DIM  = '#7D8FA5';

function Spinner({ label }: { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: `3px solid rgba(77,184,255,.15)`,
        borderTopColor: BLUE,
        animation: 'spin .8s linear infinite',
      }} />
      {label && <p style={{ color: DIM, fontSize: 14, margin: 0 }}>{label}</p>}
    </div>
  );
}

export default function ExtensionAuth() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [phase, setPhase]   = useState<Phase>('checking');
  const [errMsg, setErrMsg] = useState('');
  const ran = useRef(false);

  const params = new URLSearchParams(window.location.search);
  const extId  = params.get('ext') || '';

  // ── handshake: send token to the extension ──────────────────────────────
  async function handshake() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setPhase('needs-login'); return; }

    setPhase('linking');

    const cr = (window as any).chrome;
    if (!extId || !cr?.runtime?.sendMessage) {
      setErrMsg('Ton Tap extension not found — make sure it is installed and enabled, then try again.');
      setPhase('error');
      return;
    }

    // Wallet address: prefer live tonConnect wallet, fall back to user metadata
    const walletAddress =
      wallet?.account?.address ||
      tonConnectUI.wallet?.account?.address ||
      (session.user.user_metadata as any)?.address ||
      '';

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
        if ((window as any).chrome?.runtime?.lastError || !res?.ok) {
          setErrMsg(
            'Could not reach Ton Tap. Make sure the extension is installed and enabled, then reload this page.'
          );
          setPhase('error');
          return;
        }
        setPhase('connected');
      }
    );
  }

  // ── on mount: check for an existing session first ───────────────────────
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handshake();
        } else {
          setPhase('needs-login');
        }
      } catch {
        setPhase('needs-login');
      }
    })();
  }, []);

  // ── wallet connect flow ──────────────────────────────────────────────────
  async function connectWallet() {
    setPhase('wallet-open');
    try {
      await loginWithTonConnect(tonConnectUI);
      await handshake();
    } catch (e: any) {
      setErrMsg(e?.message || 'Wallet connection failed — please try again.');
      setPhase('error');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: BG,
      fontFamily: '-apple-system, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
    }}>
      {/* TonFunded logo */}
      <img src="/logo.png" alt="TonFunded" style={{ height: 36, marginBottom: 40, opacity: 0.92 }} />

      <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>

        {/* ── checking ── */}
        {phase === 'checking' && <Spinner label="Checking your account…" />}

        {/* ── needs login ── */}
        {phase === 'needs-login' && <>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(77,184,255,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke={BLUE} strokeWidth="1.8"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ color: TEXT, fontSize: 20, fontWeight: 700, margin: 0 }}>Connect your wallet</h2>
          <p style={{ color: DIM, fontSize: 13.5, lineHeight: 1.6, margin: 0, maxWidth: 260 }}>
            Sign in to your TonFunded account to link it with the Ton Tap extension.
          </p>
          <button onClick={connectWallet} style={{
            marginTop: 8, width: '100%', padding: '14px',
            borderRadius: 14, border: 'none', cursor: 'pointer',
            background: `linear-gradient(90deg, ${BLUE} 0%, ${BLUE2} 100%)`,
            color: '#03111E', fontSize: 15, fontWeight: 800,
          }}>
            Connect Wallet
          </button>
        </>}

        {/* ── wallet modal open ── */}
        {phase === 'wallet-open' && <Spinner label="Waiting for wallet…" />}

        {/* ── linking ── */}
        {phase === 'linking' && <Spinner label="Linking to Ton Tap…" />}

        {/* ── connected ✓ ── */}
        {phase === 'connected' && <>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 36px rgba(77,184,255,.38)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#03111E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ color: TEXT, fontSize: 26, fontWeight: 800, letterSpacing: '-.3px', margin: 0 }}>
            Connected!
          </h1>
          <p style={{ color: DIM, fontSize: 14, lineHeight: 1.65, margin: 0, maxWidth: 260 }}>
            Your TonFunded account is now linked to the extension.<br/>
            You can close this tab.
          </p>
          <button onClick={() => window.close()} style={{
            marginTop: 8, width: '100%', padding: '14px',
            borderRadius: 14, border: 'none', cursor: 'pointer',
            background: `linear-gradient(90deg, ${BLUE} 0%, ${BLUE2} 100%)`,
            color: '#03111E', fontSize: 15, fontWeight: 800,
          }}>
            Close Tab
          </button>
        </>}

        {/* ── error ── */}
        {phase === 'error' && <>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(248,113,113,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#f87171" strokeWidth="1.8"/>
              <path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ color: TEXT, fontSize: 20, fontWeight: 700, margin: 0 }}>Something went wrong</h2>
          <p style={{ color: DIM, fontSize: 13.5, lineHeight: 1.6, margin: 0, maxWidth: 260 }}>
            {errMsg}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 8 }}>
            <button onClick={() => { setPhase('needs-login'); setErrMsg(''); }} style={{
              width: '100%', padding: '13px', borderRadius: 14, border: 'none',
              cursor: 'pointer',
              background: `linear-gradient(90deg, ${BLUE} 0%, ${BLUE2} 100%)`,
              color: '#03111E', fontSize: 14, fontWeight: 800,
            }}>
              Try Again
            </button>
            <button onClick={() => window.close()} style={{
              width: '100%', padding: '13px', borderRadius: 14,
              border: '1px solid rgba(255,255,255,.08)',
              background: 'rgba(255,255,255,.05)', color: DIM,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              Close Tab
            </button>
          </div>
        </>}
      </div>

      <p style={{ marginTop: 52, color: '#1E2D42', fontSize: 12 }}>
        © TonFunded {new Date().getFullYear()}
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
