const BASE_URL = import.meta.env.VITE_API_BASE ?? 'https://api.thevaper.bot/v1';

function getInitData(): string {
  try {
    return window.Telegram?.WebApp?.initData ?? '';
  } catch {
    return '';
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      'X-Telegram-Init-Data': getInitData(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: {
      'X-Telegram-Init-Data': getInitData(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}
