import type { Product } from '@/api/types';

export function sortByStock(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const diff = (a.inStock ? 0 : 1) - (b.inStock ? 0 : 1);
    return diff; // при равенстве сохраняем порядок API
  });
}
