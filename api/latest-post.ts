export const config = { runtime: 'edge' };

interface SupabaseRow {
  text: string | null;
  photo_file_path: string | null;
  date: number | null;
  post_url: string | null;
}

function cleanText(raw: string): string {
  // Убираем Unicode Private Use Area (кастомные эмодзи Telegram)
  let t = raw.replace(/[-]/g, '').replace(/[\u{F0000}-\u{FFFFF}]/gu, '');
  // Первая непустая строка без ведущих буллетов
  for (const line of t.split('\n')) {
    const stripped = line.trim().replace(/^[\s■●•▪▸►→\-*#🔹🔸]+\s*/, '').trim();
    if (stripped.length > 2) return stripped;
  }
  return t.trim().slice(0, 120);
}

export default async function handler(): Promise<Response> {
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/latest_post?id=eq.1&select=*`, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });

  const rows = (await res.json()) as SupabaseRow[];

  if (!rows.length || !rows[0].text) {
    return new Response(JSON.stringify(null), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const row = rows[0];

  // photo_file_path теперь хранит полный URL Supabase Storage
  // Для обратной совместимости: старые записи содержат относительный путь Telegram — проксируем
  const photoUrl = row.photo_file_path
    ? row.photo_file_path.startsWith('http')
      ? row.photo_file_path
      : `/api/post-photo?fp=${encodeURIComponent(row.photo_file_path)}`
    : null;

  const text = cleanText(row.text ?? '');

  return new Response(
    JSON.stringify({ text, photoUrl, date: row.date, postUrl: row.post_url }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
