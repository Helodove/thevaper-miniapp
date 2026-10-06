// Набор иконок категорий: сетка 24×24, линия currentColor, мягкая заливка-акцент.
// Цвет задаётся родителем через CSS color.
import type { ReactNode } from 'react';

export type CategoryIconName =
  | 'disposable'
  | 'devices'
  | 'liquids'
  | 'consumables'
  | 'components'
  | 'snus'
  | 'hookah'
  | 'drinks'
  | 'misc';

const ACCENT = { fill: 'currentColor', fillOpacity: 0.18, stroke: 'none' } as const;

const GLYPHS: Record<CategoryIconName, ReactNode> = {
  // Одноразовая сигарета: наклонный корпус + пар
  disposable: (
    <>
      <g transform="rotate(32 12 14)">
        <rect {...ACCENT} x="9" y="16.5" width="6" height="5" rx="2" />
        <rect x="9" y="8.5" width="6" height="13" rx="2.2" />
        <path d="M10.5 8.5V6.3c0-.7.5-1.3 1.2-1.3h.6c.7 0 1.2.6 1.2 1.3v2.2" />
        <path d="M9 16.5h6" />
      </g>
      <path d="M18.6 5.2c.4-1 1.4-1.6 2.4-1.4" />
      <path d="M17.4 3.2c.3-.7 1-1.1 1.7-1" />
    </>
  ),
  // Под-система с экраном и кнопкой
  devices: (
    <>
      <rect x="6" y="5.5" width="12" height="16.5" rx="3.5" />
      <path d="M9.5 5.5V3.8c0-.7.6-1.3 1.3-1.3h2.4c.7 0 1.3.6 1.3 1.3v1.7" />
      <rect {...ACCENT} x="8.75" y="8.75" width="6.5" height="5" rx="1.2" />
      <rect x="8.75" y="8.75" width="6.5" height="5" rx="1.2" />
      <circle cx="12" cy="17.6" r="1.5" />
    </>
  ),
  // Флакон с капельницей + капля
  liquids: (
    <>
      <path {...ACCENT} d="M4.5 15.5h8v4.2A2.3 2.3 0 0 1 10.2 22H6.8a2.3 2.3 0 0 1-2.3-2.3Z" />
      <path d="M4.5 11.5h8v8.2A2.3 2.3 0 0 1 10.2 22H6.8a2.3 2.3 0 0 1-2.3-2.3Z" />
      <path d="M6.5 11.5V9h4v2.5" />
      <path d="M7.5 9 8.5 4l1 5" />
      <path d="M17.5 7.5c-1.9 2.4-2.9 4.1-2.9 5.5a2.9 2.9 0 0 0 5.8 0c0-1.4-1-3.1-2.9-5.5Z" />
    </>
  ),
  // Спираль испарителя на ножках
  consumables: (
    <>
      <ellipse {...ACCENT} cx="12" cy="11" rx="6.5" ry="4" />
      <ellipse cx="7.6" cy="11" rx="1.7" ry="4" />
      <ellipse cx="10.5" cy="11" rx="1.7" ry="4" />
      <ellipse cx="13.4" cy="11" rx="1.7" ry="4" />
      <ellipse cx="16.3" cy="11" rx="1.7" ry="4" />
      <path d="M5.9 11H3.5v9M18.1 11h2.4v9" />
    </>
  ),
  // Горизонтальный аккумулятор с молнией
  components: (
    <>
      <rect {...ACCENT} x="2.5" y="7" width="17" height="10" rx="2.5" />
      <rect x="2.5" y="7" width="17" height="10" rx="2.5" />
      <path d="M21.5 10.5v3" />
      <path d="m12.6 8.9-2.4 3.5h3.4l-2.4 3.5" />
    </>
  ),
  // Баночка жевательного табака
  snus: (
    <>
      <ellipse {...ACCENT} cx="12" cy="10" rx="8.5" ry="3.5" />
      <ellipse cx="12" cy="10" rx="8.5" ry="3.5" />
      <path d="M3.5 10v4.8c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5V10" />
      <path d="M3.5 12.3c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5" />
    </>
  ),
  // Кальян: чаша, блюдце, шахта, колба, шланг
  hookah: (
    <>
      <path {...ACCENT} d="M7.6 17.2h8.8a4.5 4.5 0 0 1-8.8 0Z" />
      <path d="M9.8 2.5h4.4l-.9 2.8h-2.6z" />
      <path d="M8.2 6.6h7.6" />
      <path d="M12 6.6v6" />
      <path d="M10.3 12.6h3.4v.8a4.6 4.6 0 1 1-3.4 0Z" />
      <path d="M12.8 9.2h3.6c1.8 0 3.1 1.4 3.1 3.1V21" />
    </>
  ),
  // Стакан с крышкой и трубочкой
  drinks: (
    <>
      <path {...ACCENT} d="M7 13h10l-.75 7.2A2 2 0 0 1 14.3 22H9.7a2 2 0 0 1-1.95-1.8Z" />
      <path d="M6.4 8.5h11.2l-1.35 11.7A2 2 0 0 1 14.3 22H9.7a2 2 0 0 1-1.95-1.8Z" />
      <path d="M5.5 8.5h13" />
      <path d="M12 8.5 13.8 2.8h3" />
      <path d="M7 13h10" />
    </>
  ),
  // Подарочная коробка
  misc: (
    <>
      <rect {...ACCENT} x="3.5" y="8" width="17" height="4.5" rx="1.2" />
      <rect x="3.5" y="8" width="17" height="4.5" rx="1.2" />
      <path d="M5 12.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7.5" />
      <path d="M12 8v14" />
      <path d="M12 8C10.8 4.6 7.6 3.9 7 5.6 6.4 7.4 9.4 8 12 8c2.6 0 5.6-.6 5-2.4-.6-1.7-3.8-1-5 2.4" />
    </>
  ),
};

export function CategoryIcon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: CategoryIconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}
