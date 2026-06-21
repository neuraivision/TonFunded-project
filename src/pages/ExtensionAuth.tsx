import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/tonfunded';

const BLUE  = '#4DB8FF';
const BLUE2 = '#2AA8F2';
const TEXT  = '#E8EEF8';
const DIM   = '#7D8FA5';
const DARK  = '#060C14';
const PANEL = '#03080F';
const CARD  = '#0D1520';
const ERR   = '#f87171';

export default function ExtensionAuth() {
  const params = new URLSearchParams(window.location.search);
  const extId  = params.get('ext') || '';

  // Guard: only accessible when launched by the Ton Tap extension
  if (!extId) {
    window.location.replace('/');
    return null;
  }

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [errMsg,   setErrMsg]   = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handshake(session);
    });
  }, []);

  function handshake(session: any) {
    setLoading(true);
    setErrMsg('');

    if (!extId) {
      setErrMsg('No extension ID — click "Sign In to Ton Tap" from the popup again.');
      setLoading(false);
      return;
    }
    const cr = (window as any).chrome;
    if (!cr?.runtime?.sendMessage) {
      setErrMsg('Chrome extension API not found. Use Chrome with Ton Tap installed.');
      setLoading(false);
      return;
    }

    let settled = false;
    const tid = setTimeout(() => {
      if (settled) return;
      settled = true;
      setLoading(false);
      setErrMsg('Extension timed out.\nGo to chrome://extensions → reload Ton Tap → try again.');
    }, 6000);

    cr.runtime.sendMessage(
      extId,
      {
        type:    'TONTAP_AUTH',
        token:   session.access_token,
        method:  session.user.app_metadata?.provider || 'email',
        email:   session.user.email || '',
        address: (session.user.user_metadata as any)?.address || '',
      },
      (res: { ok?: boolean } | undefined) => {
        clearTimeout(tid);
        if (settled) return;
        settled = true;
        const lastErr = (window as any).chrome?.runtime?.lastError;
        setLoading(false);
        if (lastErr) {
          setErrMsg(`Extension unreachable: ${lastErr.message}\nGo to chrome://extensions → reload Ton Tap → try again.`);
          return;
        }
        if (!res?.ok) {
          setErrMsg('Extension rejected the session.\nGo to chrome://extensions → reload Ton Tap → try again.');
          return;
        }
        setDone(true);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg('');
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !session) {
      setErrMsg(error?.message || 'Invalid email or password.');
      setLoading(false);
      return;
    }
    handshake(session);
  }

  if (done) return <ConnectedView />;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: DARK,
      fontFamily: '-apple-system,"SF Pro Text","Segoe UI",Roboto,sans-serif',
    }}>
      <LeftPanel />

      {/* ── Right panel: login form ── */}
      <div style={{
        width: 480, background: PANEL,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 44px',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <img src="/logo.png" alt="TonFunded" style={{ height: 28 }} />
            <span style={{ color: TEXT, fontSize: 15, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              TONFUNDED
            </span>
          </div>

          <h2 style={{ color: TEXT, fontSize: 28, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-.03em' }}>
            Welcome back!
          </h2>
          <p style={{ color: DIM, fontSize: 14, margin: '0 0 32px', lineHeight: 1.5 }}>
            Sign in to connect Ton Tap
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                background: CARD, border: '1px solid rgba(255,255,255,.07)',
                color: TEXT, fontSize: 14, outline: 'none',
              }}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 10,
                background: CARD, border: '1px solid rgba(255,255,255,.07)',
                color: TEXT, fontSize: 14, outline: 'none',
              }}
            />

            {errMsg && (
              <p style={{ color: ERR, fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                {errMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none', marginTop: 4,
                background: loading
                  ? 'rgba(77,184,255,.3)'
                  : `linear-gradient(90deg,${BLUE} 0%,${BLUE2} 100%)`,
                color: '#03111E', fontSize: 14, fontWeight: 800,
                cursor: loading ? 'default' : 'pointer',
                letterSpacing: '.01em',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: 'auto', paddingTop: 40, color: 'rgba(255,255,255,.08)', fontSize: 12 }}>
          © TonFunded {new Date().getFullYear()}
        </p>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #1E3050; }
        input:focus { border-color: rgba(77,184,255,.35) !important; }
      `}</style>
    </div>
  );
}

function LeftPanel() {
  return (
    <div style={{
      flex: 1, position: 'relative', overflow: 'hidden',
      background: DARK,
      display: 'flex', flexDirection: 'column',
      padding: '60px 60px 0',
    }}>
      {/* Subtle blue glow — top right */}
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(77,184,255,0.11) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Tagline */}
      <h1 style={{
        color: TEXT, fontSize: 58, fontWeight: 900,
        lineHeight: 1.06, letterSpacing: '-0.045em',
        margin: '0 0 52px',
        position: 'relative', zIndex: 1, maxWidth: 520,
      }}>
        Trade TON.<br />
        Get Funded. <span style={{ color: BLUE }}>Repeat.</span>
      </h1>

      {/* Terminal card — floats up from bottom */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, minHeight: 0,
        borderRadius: '14px 14px 0 0',
        overflow: 'hidden',
        border: '1px solid rgba(77,184,255,0.1)',
        borderBottom: 'none',
        boxShadow: '0 -8px 60px rgba(77,184,255,0.07)',
      }}>
        <img
          src="/terminal-preview.jpg"
          alt="TonFunded Terminal"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
      </div>
    </div>
  );
}

function ConnectedView() {
  const [secs, setSecs] = useState(3);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    const c = setTimeout(() => window.close(), 3000);
    return () => { clearInterval(t); clearTimeout(c); };
  }, []);

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: DARK,
      fontFamily: '-apple-system,"SF Pro Text","Segoe UI",Roboto,sans-serif',
    }}>
      <LeftPanel />

      {/* Right: connected state */}
      <div style={{
        width: 480, background: PANEL,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 44px', textAlign: 'center',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        gap: 20,
      }}>
        {/* Checkmark with pulse rings */}
        <div style={{ position: 'relative', width: 76, height: 76, marginBottom: 12 }}>
          <div className="tf-ring tf-ring1" />
          <div className="tf-ring tf-ring2" />
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: `linear-gradient(135deg,${BLUE} 0%,${BLUE2} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 0 rgba(77,184,255,.4), 0 8px 40px rgba(77,184,255,.3)`,
            animation: 'tf-pop .5s cubic-bezier(.34,1.56,.64,1) forwards',
            position: 'relative', zIndex: 1,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#03111E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div style={{ animation: 'tf-fadein .5s .25s both' }}>
          <h2 style={{ color: TEXT, fontSize: 32, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-.03em' }}>
            Connected!
          </h2>
          <p style={{ color: DIM, fontSize: 14, lineHeight: 1.75, margin: 0, maxWidth: 270 }}>
            Your TonFunded account is now<br />linked to the Ton Tap extension.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 10, animation: 'tf-fadein .5s .4s both' }}>
          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10,
            background: 'rgba(77,184,255,.07)', border: '1px solid rgba(77,184,255,.15)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            <span style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>Extension active</span>
          </div>

          <button
            onClick={() => window.close()}
            style={{
              padding: '14px 0', borderRadius: 10, border: 'none',
              background: `linear-gradient(90deg,${BLUE} 0%,${BLUE2} 100%)`,
              color: '#03111E', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              width: '100%', letterSpacing: '.01em',
            }}
          >
            Close Tab
          </button>
        </div>

        <p style={{ color: 'rgba(255,255,255,.12)', fontSize: 12, margin: 0, animation: 'tf-fadein .5s .55s both' }}>
          Closes automatically in {secs}s
        </p>

        <p style={{ marginTop: 'auto', paddingTop: 24, color: 'rgba(255,255,255,.08)', fontSize: 12 }}>
          © TonFunded {new Date().getFullYear()}
        </p>
      </div>

      <style>{`
        @keyframes tf-pop { from { transform: scale(.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes tf-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @keyframes tf-pulse {
          0%   { transform: scale(1);   opacity: .55; }
          100% { transform: scale(2.4); opacity: 0;   }
        }
        .tf-ring {
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(77,184,255,.45);
          animation: tf-pulse 2s ease-out infinite;
          top: 0; left: 0; width: 76px; height: 76px;
        }
        .tf-ring2 { animation-delay: .7s; border-color: rgba(77,184,255,.25); }
      `}</style>
    </div>
  );
}
