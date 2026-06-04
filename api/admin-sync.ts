export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'thevaper2026';
const RAILWAY_URL = 'https://vape-catalog-bot-helodove.amvera.io';

const STRIP_PREFIXES = [
  'Жидкость ', 'Испаритель ', 'Испаритель(и) ',
  'Картридж ', 'Картридж(и) ', 'ЭОП ', 'Устройство ',
  'Табак для кальяна ', 'Кальянный табак ', 'Табак кальянный ',
];

const TOBACCO_PREFIXES = new Set([
  'Табак для кальяна ', 'Кальянный табак ', 'Табак кальянный ',
]);

function extractLine(raw: string): string {
  let n = raw.trim();
  let isTobacco = false;
  for (const p of STRIP_PREFIXES) {
    if (n.startsWith(p)) {
      isTobacco = TOBACCO_PREFIXES.has(p);
      n = n.slice(p.length);
      break;
    }
  }
  // Убираем вкус/цвет в скобках: "OGGO MAX (Арбуз)" → "OGGO MAX"
  n = n.replace(/\s*\([^)]*\)\s*$/, '').trim();
  // Убираем вес и технические параметры в конце: "25 гр", "50 г", "0.4 Ohm"
  n = n.replace(/\s+[\d.,]+\s*(гр\.?|г\.?|мл|л|ml|l|мг|mg|ohm|ом|mah|puff|затяжк|%)\b.*$/i, '').trim();
  // Для табака оставляем только бренд (первое слово) — одна фото покрывает все вкусы
  if (isTobacco && n.includes(' ')) {
    n = n.split(' ')[0];
  }
  return n || raw.trim();
}

function isCovered(line: string, existing: string[]): boolean {
  const ll = line.toLowerCase();
  return existing.some((e) => e === ll || ll.includes(e) || e.includes(ll));
}

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const password = req.headers.get('x-admin-password') ?? '';
  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // 1. Все категории из Railway
  const catsRes = await fetch(`${RAILWAY_URL}/v1/categories`);
  const categories = (await catsRes.json()) as { id: string }[];

  // 2. Параллельно загружаем товары из всех категорий
  const pages = await Promise.all(
    categories.map((cat) =>
      fetch(`${RAILWAY_URL}/v1/products?categoryId=${cat.id}&limit=200`)
        .then((r) => r.json())
        .then((d: { items: { name: string }[] }) => d.items ?? [])
        .catch(() => [] as { name: string }[])
    )
  );

  // 3. Извлекаем уникальные линейки
  const lineSet = new Set<string>();
  for (const items of pages) {
    for (const p of items) {
      lineSet.add(extractLine(p.name));
    }
  }

  // 4. Существующие записи из Supabase
  const existRes = await fetch(
    `${SUPABASE_URL}/rest/v1/product_images?select=product_name`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const existing = ((await existRes.json()) as { product_name: string }[]).map(
    (e) => e.product_name.toLowerCase()
  );

  // 5. Отбираем только непокрытые линейки
  const toAdd = [...lineSet].filter((line) => !isCovered(line, existing));

  // 6. Вставляем в Supabase (пустой image_url — нужно добавить фото вручную)
  if (toAdd.length > 0) {
    const rows = toAdd.map((name) => ({
      product_name: name,
      image_url: '',
      note: 'автосинхронизация',
    }));
    await fetch(`${SUPABASE_URL}/rest/v1/product_images`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(rows),
    });
  }

  return new Response(JSON.stringify({ added: toAdd.length, lines: toAdd }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
