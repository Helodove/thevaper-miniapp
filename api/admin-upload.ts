export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'thevaper2026';
const BUCKET = 'product-images';

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'x-admin-password',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const password = req.headers.get('x-admin-password') ?? '';
  if (password !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Неверный пароль' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // Получаем base64 из JSON (edge runtime не поддерживает formData для бинарных файлов)
  const body = await req.json();
  const { base64, contentType, ext } = body;

  if (!base64 || !ext) {
    return new Response(JSON.stringify({ error: 'Нет данных файла' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // base64 → бинарник
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const filename = `img-${Date.now()}.${ext}`;

  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': contentType || 'image/jpeg',
      'x-upsert': 'true',
    },
    body: bytes,
  });

  if (!r.ok) {
    const err = await r.text();
    return new Response(JSON.stringify({ error: err }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
  return new Response(JSON.stringify({ url: publicUrl }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
