import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './index.css';

function TelegramInit() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const applyTheme = () => {
      const scheme = (window as any).Telegram?.WebApp?.colorScheme
        ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', scheme === 'dark');
    };

    applyTheme();
    const timer = setTimeout(applyTheme, 300);

    const tgInst = (window as any).Telegram?.WebApp;
    if (tgInst?.onEvent) {
      tgInst.onEvent('themeChanged', applyTheme);
      return () => { clearTimeout(timer); tgInst.offEvent('themeChanged', applyTheme); };
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyTheme);
    return () => { clearTimeout(timer); mq.removeEventListener('change', applyTheme); };
  }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
        <TelegramInit />
        <App />
      </TonConnectUIProvider>
    </BrowserRouter>
  </StrictMode>
);
