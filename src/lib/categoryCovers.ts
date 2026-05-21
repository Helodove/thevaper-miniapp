// Маппинг slug/title → локальный SVG-файл обложки
const COVERS: Record<string, string> = {
  'эоп': '/categories/devices.svg',
  'устройства': '/categories/devices.svg',
  'жидкости': '/categories/liquids.svg',
  'напитки': '/categories/liquids.svg',
  'расходники': '/categories/consumables.svg',
  'картриджи': '/categories/consumables.svg',
  'комплектующие': '/categories/components.svg',
  'ароматизаторы': '/categories/misc.svg',
  'табак': '/categories/tobacco.svg',
  'кальян': '/categories/tobacco.svg',
  'жевательный': '/categories/tobacco.svg',
  'разное': '/categories/misc.svg',
  'мерч': '/categories/misc.svg',
};

export function getCategoryCover(title: string): string {
  const key = title.toLowerCase();
  for (const [k, v] of Object.entries(COVERS)) {
    if (key.includes(k)) return v;
  }
  return '/categories/misc.svg';
}
