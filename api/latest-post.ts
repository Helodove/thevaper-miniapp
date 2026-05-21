export const config = { runtime: 'edge' };

interface SupabaseRow {
  text: string | null;
  photo_file_path: string | null;
  date: number | null;
  post_url: string | null;
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
  const photoUrl = row.photo_file_path
    ? `/api/post-photo?fp=${encodeURIComponent(row.photo_file_path)}`
    : null;

  return new Response(
    JSON.stringify({ text: row.text, photoUrl, date: row.date, postUrl: row.post_url }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
