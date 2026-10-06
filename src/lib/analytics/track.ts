/**
 * Продуктовая аналитика: track(event, data).
 *
 * События копятся в очереди и уходят на POST /events пачкой:
 *  - как только набралось 10 событий,
 *  - раз в 15 секунд,
 *  - при сворачивании/закрытии Mini App (visibilitychange → hidden, pagehide).
 * Отправка через navigator.sendBeacon, если не вышло — fetch с keepalive.
 * Вместе с пачкой уходит Telegram initData — по нему сервер проверяет подпись и считает user_hash.
 *
 * Трекер никогда не ломает интерфейс: любые его ошибки глотаются.
 * Список событий — events.json (копия analytics/events.json из бэкенда).
 */
import spec from './events.json';
import { BASE_URL } from '@/api/client';

export type EventName = keyof typeof spec.events;

export type TrackData = {
  product_id?: string;
  store_id?: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

type QueuedEvent = {
  eid: string;
  event: EventName;
  ts: number;
  product_id?: string;
  store_id?: string;
  meta?: Record<string, string | number | boolean>;
};

const ENDPOINT = `${BASE_URL}/events`;
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 15_000;
const MAX_PER_REQUEST = 50; // лимит сервера
const MAX_QUEUE = 200;      // защита памяти, если сеть недоступна долго

const CLIENT_EVENTS = new Set(
  Object.entries(spec.events)
    .filter(([, s]) => (s.source as string[]).includes('client'))
    .map(([name]) => name),
);

let queue: QueuedEvent[] = [];
let started = false;

function uuid4(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function getInitData(): string {
  try {
    return window.Telegram?.WebApp?.initData ?? '';
  } catch {
    return '';
  }
}

function cleanMeta(meta: TrackData['meta']): QueuedEvent['meta'] {
  if (!meta) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = typeof v === 'string' ? v.slice(0, 200) : v; // лимит строки на сервере
  }
  return out;
}

function send(body: string): void {
  // text/plain — «простой» CORS-запрос без preflight; сервер разбирает JSON независимо от типа
  try {
    const blob = new Blob([body], { type: 'text/plain;charset=UTF-8' });
    if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
  } catch {
    /* fallback ниже */
  }
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      body,
      keepalive: true,
      credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    }).catch(() => {});
  } catch {
    /* трекер не должен ломать UI */
  }
}

export function flush(): void {
  try {
    if (queue.length === 0) return;
    const initData = getInitData();
    if (!initData) {
      // вне Telegram (браузер, локальная разработка) сервер всё равно отклонит события
      queue = [];
      return;
    }
    while (queue.length > 0) {
      const events = queue.splice(0, MAX_PER_REQUEST);
      send(JSON.stringify({ initData, sent_at: Date.now(), events }));
    }
  } catch {
    queue = [];
  }
}

function start(): void {
  if (started) return;
  started = true;
  try {
    window.setInterval(flush, FLUSH_INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);
  } catch {
    /* трекер не должен ломать UI */
  }
}

export function track(event: EventName, data: TrackData = {}): void {
  try {
    if (!CLIENT_EVENTS.has(event)) return; // reserve_create пишет только сервер
    start();
    queue.push({
      eid: uuid4(),
      event,
      ts: Date.now(),
      product_id: data.product_id || undefined,
      store_id: data.store_id || undefined,
      meta: cleanMeta(data.meta),
    });
    if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
    if (queue.length >= BATCH_SIZE) flush();
  } catch {
    /* трекер не должен ломать UI */
  }
}
