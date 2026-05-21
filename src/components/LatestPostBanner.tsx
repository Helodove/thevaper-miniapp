import { useQuery } from '@tanstack/react-query';
import { openTelegramLink } from '@/lib/telegram';

interface LatestPost {
  text: string;
  photoUrl: string | null;
  date: number;
  postUrl: string;
}

async function fetchLatestPost(): Promise<LatestPost | null> {
  const res = await fetch('/api/latest-post');
  if (!res.ok) throw new Error('API error');
  return res.json() as Promise<LatestPost | null>;
}

function BannerSkeleton() {
  return (
    <div
      className="mx-4 rounded-[24px] shimmer"
      style={{ minHeight: 180 }}
    />
  );
}

function StaticBanner() {
  return (
    <div
      className="mx-4 rounded-[24px] overflow-hidden relative p-6 flex flex-col justify-end"
      style={{ background: 'var(--brand-gradient)', minHeight: 180 }}
    >
      <img
        src="/logo-thevaper-original.png"
        alt=""
        className="absolute top-4 right-4 rounded-xl"
        style={{ width: 40, height: 40, opacity: 0.9 }}
      />
      <p className="text-white text-[13px] font-medium opacity-80 mb-1">Добро пожаловать</p>
      <h2 className="text-white text-[22px] font-extrabold leading-tight tracking-tight">
        TheVaper
      </h2>
    </div>
  );
}

export function LatestPostBanner() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['latest-post'],
    queryFn: fetchLatestPost,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <BannerSkeleton />;
  if (isError || !data) return <StaticBanner />;

  function handleClick() {
    openTelegramLink(data!.postUrl);
  }

  return (
    <div
      onClick={handleClick}
      className="mx-4 rounded-[24px] overflow-hidden relative cursor-pointer active:opacity-90"
      style={{ background: 'var(--brand-gradient)', minHeight: 180 }}
    >
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Затемнение снизу для читаемости текста */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }}
      />
      {!data.photoUrl && (
        <img
          src="/logo-thevaper-original.png"
          alt=""
          className="absolute top-4 right-4 rounded-xl"
          style={{ width: 40, height: 40, opacity: 0.9 }}
        />
      )}
      <div className="relative z-10 p-6 pt-10">
        <p className="text-white text-[13px] font-medium opacity-75 mb-1">Новости магазина</p>
        <h2
          className="text-white text-[17px] font-extrabold leading-snug tracking-tight"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {data.text}
        </h2>
        <div className="mt-3 bg-white/20 text-white text-[13px] font-semibold rounded-xl px-4 py-2 inline-block backdrop-blur-sm">
          Читать в Telegram
        </div>
      </div>
    </div>
  );
}
