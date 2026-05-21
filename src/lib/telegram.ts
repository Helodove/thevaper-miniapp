declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  colorScheme: 'light' | 'dark';
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  openLink: (url: string) => void;
}

export const tg = (): TelegramWebApp | null =>
  window.Telegram?.WebApp ?? null;

export function initTelegram(): void {
  const app = tg();
  if (!app) return;
  app.ready();
  app.expand();
  app.setHeaderColor('#1FBFAD');
  app.setBackgroundColor('#F4FBFA');
}

export function getColorScheme(): 'light' | 'dark' {
  return tg()?.colorScheme ?? 'light';
}

export function haptic(kind: 'light' | 'medium' | 'success' | 'error'): void {
  const app = tg();
  if (!app) return;
  if (kind === 'success' || kind === 'error') {
    app.HapticFeedback.notificationOccurred(kind);
  } else {
    app.HapticFeedback.impactOccurred(kind);
  }
}

export function showMainButton(text: string, onClick: () => void): void {
  const app = tg();
  if (!app) return;
  app.MainButton.setText(text);
  app.MainButton.color = '#1FBFAD';
  app.MainButton.textColor = '#FFFFFF';
  app.MainButton.onClick(onClick);
  app.MainButton.show();
}

export function hideMainButton(onClick?: () => void): void {
  const app = tg();
  if (!app) return;
  if (onClick) app.MainButton.offClick(onClick);
  app.MainButton.hide();
}

export function sendOrder(payload: unknown): void {
  const app = tg();
  if (app) {
    app.sendData(JSON.stringify(payload));
    app.close();
  }
}

export function openLink(url: string): void {
  tg()?.openLink(url);
}
