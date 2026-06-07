import { useEffect, useCallback, useState } from 'react';

// Telegram WebApp types
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  themeParams: Record<string, string>;
  colorScheme: 'light' | 'dark';
  viewportHeight: number;
  viewportStableHeight: number;
  isExpanded: boolean;
  safeAreaInset: { top: number; bottom: number; left: number; right: number };
  contentSafeAreaInset: { top: number; bottom: number; left: number; right: number };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  platform: string;
  version: string;
  headerColor: string;
  backgroundColor: string;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  BackButton: { isVisible: boolean; show: () => void; hide: () => void; onClick: (cb: () => void) => void };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    setParams: (params: Record<string, unknown>) => void;
  };
}

interface TelegramWindow {
  WebApp: TelegramWebApp;
}

function getTelegramWebApp(): TelegramWebApp | null {
  const tg = (window as unknown as { Telegram?: TelegramWindow }).Telegram;
  return tg?.WebApp ?? null;
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setIsReady(true);
    } else {
      // Running outside Telegram — still mark as ready for web testing
      setIsReady(true);
    }
  }, []);

  const hapticImpact = useCallback(
    (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    [webApp]
  );

  const hapticNotification = useCallback(
    (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    [webApp]
  );

  const getThemeParams = useCallback(() => {
    if (!webApp) {
      return {
        bg_color: '#f9f7f4',
        text_color: '#0a0a0a',
        hint_color: '#6b7280',
        link_color: '#4DB8FF',
        button_color: '#4DB8FF',
        button_text_color: '#ffffff',
        secondary_bg_color: '#ffffff',
      };
    }
    return webApp.themeParams;
  }, [webApp]);

  const getSafeAreaInsets = useCallback(() => {
    if (!webApp) return { top: 0, bottom: 0, left: 0, right: 0 };
    return webApp.safeAreaInset;
  }, [webApp]);

  return {
    webApp,
    isReady,
    hapticImpact,
    hapticNotification,
    getThemeParams,
    getSafeAreaInsets,
    platform: webApp?.platform ?? 'web',
  };
}
