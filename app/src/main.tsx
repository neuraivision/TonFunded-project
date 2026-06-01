import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './index.css';

function TelegramThemeSync() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    const applyTheme = () => {
      const scheme = tg?.colorScheme ?? 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      if (scheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply immediately
    applyTheme();

    // Listen for Telegram theme changes
    if (tg) {
      tg.onEvent('themeChanged', applyTheme);
      return () => tg.offEvent('themeChanged', applyTheme);
    }

    // Fallback: listen to OS preference changes when outside Telegram
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
    return () => mq.removeEventListener('change', applyTheme);
  }, []);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
        <TelegramThemeSync />
        <App />
      </TonConnectUIProvider>
    </BrowserRouter>
  </StrictMode>
);
