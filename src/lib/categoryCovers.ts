// Маппинг slug/title → локальный SVG-файл обложки
// ВАЖНО: более специфичные ключи должны идти РАНЬШЕ общих.
// Например, 'жевательный' до 'табак' — иначе "Жевательный табак" совпадёт с 'табак'.
const COVERS: Record<string, string> = {
  'одноразов': '/categories/disposable.svg',
  'эоп': '/categories/disposable.svg',
  'устройства': '/categories/devices.svg',
  'жидкости': '/categories/liquids.svg',
  'напитки': '/categories/drinks.svg',
  'расходники': '/categories/consumables.svg',
  'картриджи': '/categories/consumables.svg',
  'комплектующие': '/categories/components.svg',
  'ароматизаторы': '/categories/liquids.svg',
  'жевательный': '/categories/snus.svg',
  'табак': '/categories/tobacco.svg',
  'кальян': '/categories/tobacco.svg',
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

// Переопределение названий категорий (точное совпадение, без учёта регистра)
const TITLE_OVERRIDES: Record<string, string> = {
  'эоп': 'Одноразовые сигареты',
};

export function getCategoryTitle(title: string): string {
  return TITLE_OVERRIDES[title.toLowerCase()] ?? title;
}
