import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/**
 * Catches any render-time error in the tree and shows a clean fallback instead
 * of a blank white screen. Logs the error for debugging.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TonFunded] Render error:', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: '#090E17',
            color: '#E8EEF8',
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          }}
        >
          <img
            src="/logo-192.png"
            alt="TonFunded"
            width={56}
            height={56}
            style={{ borderRadius: 14, marginBottom: 18 }}
          />
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: '#7D8FA5', margin: '8px 0 0', maxWidth: 300, lineHeight: 1.5 }}>
            The app hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: 22,
              padding: '12px 26px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 700,
              color: '#061018',
              background: 'linear-gradient(135deg, #4DB8FF 0%, #2AA8F2 100%)',
              boxShadow: '0 6px 22px rgba(77,184,255,0.32)',
            }}
          >
            Reload
          </button>
          <a
            href="https://t.me/tonfunded"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 16, fontSize: 13, color: '#7D8FA5', textDecoration: 'none' }}
          >
            Still stuck? Contact support →
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
