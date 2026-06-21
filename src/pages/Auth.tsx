import { useState } from 'react';
import { supabase } from '@/lib/tonfunded';

const BLUE  = '#4DB8FF';
const BLUE2 = '#2AA8F2';
const TEXT  = '#E8EEF8';
const DIM   = '#7D8FA5';
const DARK  = '#060C14';
const PANEL = '#03080F';
const CARD  = '#0D1520';
const ERR   = '#f87171';

function LeftPanel() {
  return (
    <div style={{
      flex: 1, position: 'relative', overflow: 'hidden',
      background: DARK, display: 'flex', flexDirection: 'column',
      padding: '60px 60px 0',
    }}>
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(77,184,255,0.11) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <h1 style={{
        color: TEXT, fontSize: 58, fontWeight: 900,
        lineHeight: 1.06, letterSpacing: '-0.045em',
        margin: '0 0 52px', position: 'relative', zIndex: 1, maxWidth: 520,
      }}>
        Trade TON.<br />
        Get Funded. <span style={{ color: BLUE }}>Repeat.</span>
      </h1>
      <div style={{
        position: 'relative', zIndex: 1, flex: 1, minHeight: 0,
        borderRadius: '14px 14px 0 0', overflow: 'hidden',
        border: '1px solid rgba(77,184,255,0.1)', borderBottom: 'none',
        boxShadow: '0 -8px 60px rgba(77,184,255,0.07)',
      }}>
        <img src="/terminal-preview.jpg" alt="TonFunded Terminal"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
      </div>
    </div>
  );
}

type Mode = 'signin' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode]         = useState<Mode>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [errMsg, setErrMsg]     = useState('');
  const [info, setInfo]         = useState('');

  function reset(clearName = false) { setErrMsg(''); setInfo(''); if (clearName) setName(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });
      setLoading(false);
      if (error) { setErrMsg(error.message); return; }
      setInfo('Check your email for a password reset link.');
      return;
    }

    if (mode === 'signup') {
      const trimmedName = name.trim();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: trimmedName ? { name: trimmedName } : undefined },
      });
      if (!error && data.session && trimmedName) {
        await supabase.from('users').update({ name: trimmedName }).eq('id', data.session.user.id);
      }
      setLoading(false);
      if (error) { setErrMsg(error.message); return; }
      setInfo('Account created! Check your email to confirm, then sign in.');
      setMode('signin');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) { setErrMsg(error.message); return; }
    window.location.href = '/';
  }

  async function handleGoogle() {
    reset();
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    });
  }

  const titles: Record<Mode, string>  = { signin: 'Welcome back!', signup: 'Create account', forgot: 'Reset password' };
  const btnLabel: Record<Mode, string> = { signin: 'Sign in', signup: 'Create account', forgot: 'Send reset link' };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: DARK,
      fontFamily: '-apple-system,"SF Pro Text","Segoe UI",Roboto,sans-serif',
    }}>
      <LeftPanel />

      <div style={{
        width: 480, background: PANEL,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 44px',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <img src="/logo.png" alt="TonFunded" style={{ height: 28 }} />
            <span style={{ color: TEXT, fontSize: 15, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              TONFUNDED
            </span>
          </div>

          <h2 style={{ color: TEXT, fontSize: 28, fontWeight: 900, margin: '0 0 28px', letterSpacing: '-.03em' }}>
            {titles[mode]}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <input
                type="text" placeholder="Your full name"
                value={name} onChange={e => setName(e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: CARD, border: '1px solid rgba(255,255,255,.07)', color: TEXT, fontSize: 14, outline: 'none' }}
              />
            )}
            <input
              type="email" placeholder="Enter your email"
              value={email} onChange={e => setEmail(e.target.value)}
              required disabled={loading}
              style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: CARD, border: '1px solid rgba(255,255,255,.07)', color: TEXT, fontSize: 14, outline: 'none' }}
            />
            {mode !== 'forgot' && (
              <input
                type="password" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)}
                required disabled={loading}
                style={{ width: '100%', padding: '14px 16px', borderRadius: 10, background: CARD, border: '1px solid rgba(255,255,255,.07)', color: TEXT, fontSize: 14, outline: 'none' }}
              />
            )}

            {errMsg && <p style={{ color: ERR, fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.55 }}>{errMsg}</p>}
            {info  && <p style={{ color: '#4ade80', fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.55 }}>{info}</p>}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none', marginTop: 4,
              background: loading ? 'rgba(77,184,255,.3)' : `linear-gradient(90deg,${BLUE} 0%,${BLUE2} 100%)`,
              color: '#03111E', fontSize: 14, fontWeight: 800,
              cursor: loading ? 'default' : 'pointer', letterSpacing: '.01em',
            }}>
              {loading ? '…' : btnLabel[mode]}
            </button>
          </form>

          {mode === 'signin' && (
            <>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
                <span style={{ color: DIM, fontSize: 13 }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
              </div>

              {/* Google */}
              <button onClick={handleGoogle} disabled={loading} style={{
                width: '100%', padding: '13px 16px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,.1)',
                background: 'rgba(255,255,255,.04)', color: TEXT, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              {/* Footer links */}
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <p style={{ color: DIM, fontSize: 14, margin: '0 0 10px' }}>
                  Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); reset(true); }} style={{ background: 'none', border: 'none', color: TEXT, fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0 }}>
                    Sign up
                  </button>
                </p>
                <button onClick={() => { setMode('forgot'); reset(); }} style={{ background: 'none', border: 'none', color: DIM, fontSize: 14, cursor: 'pointer', padding: 0 }}>
                  Forgot password
                </button>
              </div>
            </>
          )}

          {mode !== 'signin' && (
            <p style={{ marginTop: 20, textAlign: 'center', color: DIM, fontSize: 14 }}>
              <button onClick={() => { setMode('signin'); reset(); }} style={{ background: 'none', border: 'none', color: BLUE, fontSize: 14, cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                ← Back to sign in
              </button>
            </p>
          )}
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
