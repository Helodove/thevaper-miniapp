import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shop } from '@/api/types';

type ShopStore = {
  selectedShop: Shop | null;
  setShop: (shop: Shop | null) => void;
};

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      selectedShop: null,
      setShop: (shop) => set({ selectedShop: shop }),
    }),
    { name: 'thevaper-shop' }
  )
);
