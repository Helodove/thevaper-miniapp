export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'thevaper2026';

function sbHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const password = url.searchParams.get('password') ?? req.headers.get('x-admin-password') ?? '';

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Неверный пароль' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const base = `${SUPABASE_URL}/rest/v1/product_images`;

  // GET — список всех записей
  if (req.method === 'GET') {
    const r = await fetch(`${base}?select=*&order=id`, { headers: sbHeaders() });
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // POST — добавить запись
  if (req.method === 'POST') {
    const body = await req.json();
    const r = await fetch(base, {
      method: 'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        product_name: body.product_name?.trim(),
        image_url: body.image_url?.trim(),
        note: body.note?.trim() || null,
      }),
    });
    const data = await r.json();
    return new Response(JSON.stringify(data), {
      status: r.ok ? 200 : 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // PATCH — обновить image_url по id
  if (req.method === 'PATCH') {
    const id = url.searchParams.get('id');
    if (!id) return new Response('Missing id', { status: 400 });
    const body = await req.json();
    const r = await fetch(`${base}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ image_url: body.image_url }),
    });
    return new Response(JSON.stringify({ ok: r.ok }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // DELETE — удалить по id
  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return new Response('Missing id', { status: 400 });
    await fetch(`${base}?id=eq.${id}`, { method: 'DELETE', headers: sbHeaders() });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
