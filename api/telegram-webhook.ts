export const config = { runtime: 'edge' };

interface TgPhoto {
  file_id: string;
  file_size: number;
}

interface TgChannelPost {
  message_id: number;
  chat: { id: number };
  text?: string;
  caption?: string;
  photo?: TgPhoto[];
  date: number;
}

interface TgUpdate {
  channel_post?: TgChannelPost;
}

interface TgFileResponse {
  ok: boolean;
  result?: { file_path?: string };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const update = (await req.json()) as TgUpdate;
  const post = update.channel_post;
  if (!post) return new Response('OK');

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID!;
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

  const text = post.text ?? post.caption ?? '';

  let photoFilePath: string | null = null;
  if (post.photo && post.photo.length > 0) {
    const largest = post.photo.reduce((a, b) => (a.file_size > b.file_size ? a : b));
    const fileRes = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getFile?file_id=${largest.file_id}`
    );
    const fileData = (await fileRes.json()) as TgFileResponse;
    photoFilePath = fileData.result?.file_path ?? null;
  }

  // t.me/c/<channel_without_-100>/<message_id>
  const channelShort = String(Math.abs(Number(CHANNEL_ID))).slice(3);
  const postUrl = `https://t.me/c/${channelShort}/${post.message_id}`;

  await fetch(`${SUPABASE_URL}/rest/v1/latest_post?id=eq.1`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      text,
      photo_file_path: photoFilePath,
      date: post.date,
      post_url: postUrl,
      updated_at: new Date().toISOString(),
    }),
  });

  return new Response('OK');
}
