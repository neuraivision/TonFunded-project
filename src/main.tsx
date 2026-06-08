import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function TelegramThemeSync() {
  useEffect(() => {
    const applyTheme = () => {
      // Re-read WebApp each time — Telegram updates it in place
      const tg = (window as any).Telegram?.WebApp;
      const scheme =
        tg?.colorScheme ??
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      if (scheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply immediately on mount
    applyTheme();

    // Also fire after a short delay — Telegram WebApp can be slow to expose colorScheme
    const timer = setTimeout(applyTheme, 300);

    // Listen for Telegram theme changes
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.onEvent) {
      tg.onEvent('themeChanged', applyTheme);
      return () => {
        clearTimeout(timer);
        tg.offEvent('themeChanged', applyTheme);
      };
    }

    // Fallback: OS preference changes (for browser testing)
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
    return () => {
      clearTimeout(timer);
      mq.removeEventListener('change', applyTheme);
    };
  }, []);

  return null;
}

// TON Connect manifest: served from this app's own origin so the wallet shows
// TonFunded's name + icon. Override via VITE_TONCONNECT_MANIFEST_URL when the
// production domain differs from where the app is hosted.
const manifestUrl =
  import.meta.env.VITE_TONCONNECT_MANIFEST_URL ||
  `${window.location.origin}/tonconnect-manifest.json`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <TelegramThemeSync />
          <App />
        </TonConnectUIProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
