export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const filePath = url.searchParams.get('fp');

  if (!filePath) {
    return new Response('Missing fp', { status: 400 });
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const imageRes = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${filePath}`);

  if (!imageRes.ok) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(imageRes.body, {
    headers: {
      'Content-Type': imageRes.headers.get('Content-Type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
