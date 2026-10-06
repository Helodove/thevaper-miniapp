import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shop } from '@/api/types';
import { track } from '@/lib/analytics/track';

type ShopStore = {
  selectedShop: Shop | null;
  setShop: (shop: Shop | null) => void;
};

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      selectedShop: null,
      setShop: (shop) => {
        set({ selectedShop: shop });
        // единая точка выбора магазина: стартовый экран, корзина, карточка товара
        if (shop) track('store_select', { store_id: shop.id });
      },
    }),
    { name: 'thevaper-shop' }
  )
);
