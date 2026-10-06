import type { CategoryIconName } from '@/components/CategoryIcon';

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

// Стиль плитки категории: иконка + свой цвет (светлая и тёмная тема).
// Тёмные цвета посчитаны заранее, без color-mix — для старых WebView.
export type CategoryTileStyle = {
  icon: CategoryIconName;
  tint: string;     // фон плитки, светлая тема
  ink: string;      // текст и иконка, светлая тема
  tintDark: string; // фон плитки, тёмная тема
  inkDark: string;  // текст и иконка, тёмная тема
};

const TILE_STYLES: Record<CategoryIconName, Omit<CategoryTileStyle, 'icon'>> = {
  disposable:  { tint: '#CDEFE9', ink: '#0E5E54', tintDark: '#144640', inkDark: '#CDEFE9' },
  devices:     { tint: '#DCEBFF', ink: '#1F4F8F', tintDark: '#1C3E5D', inkDark: '#DCEBFF' },
  liquids:     { tint: '#E6F7C9', ink: '#3E6312', tintDark: '#2C481E', inkDark: '#E6F7C9' },
  consumables: { tint: '#FFE8D2', ink: '#8A4A12', tintDark: '#523C1E', inkDark: '#FFE8D2' },
  components:  { tint: '#ECE3FF', ink: '#4E3394', tintDark: '#343060', inkDark: '#ECE3FF' },
  snus:        { tint: '#FFE1E6', ink: '#8E2A3E', tintDark: '#542C34', inkDark: '#FFE1E6' },
  hookah:      { tint: '#F3EAD8', ink: '#6B4E1E', tintDark: '#423E24', inkDark: '#F3EAD8' },
  drinks:      { tint: '#D6F3FA', ink: '#11606F', tintDark: '#16464D', inkDark: '#D6F3FA' },
  misc:        { tint: '#E9EEED', ink: '#3B4A48', tintDark: '#2A3C3A', inkDark: '#E9EEED' },
};

// Те же правила, что и для обложек: более специфичные ключи — раньше общих.
const TILE_ICONS: [string, CategoryIconName][] = [
  ['одноразов', 'disposable'],
  ['эоп', 'disposable'],
  ['устройства', 'devices'],
  ['жидкости', 'liquids'],
  ['ароматизаторы', 'liquids'],
  ['напитки', 'drinks'],
  ['расходники', 'consumables'],
  ['картриджи', 'consumables'],
  ['комплектующие', 'components'],
  ['жевательный', 'snus'],
  ['табак', 'hookah'],
  ['кальян', 'hookah'],
  ['разное', 'misc'],
  ['мерч', 'misc'],
];

export function getCategoryTileStyle(title: string): CategoryTileStyle {
  const key = title.toLowerCase();
  const icon = TILE_ICONS.find(([k]) => key.includes(k))?.[1] ?? 'misc';
  return { icon, ...TILE_STYLES[icon] };
}

// Переопределение названий категорий (точное совпадение, без учёта регистра)
const TITLE_OVERRIDES: Record<string, string> = {
  'эоп': 'Одноразовые сигареты',
};

export function getCategoryTitle(title: string): string {
  return TITLE_OVERRIDES[title.toLowerCase()] ?? title;
}
