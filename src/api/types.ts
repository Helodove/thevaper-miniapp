export type Category = {
  id: string;
  title: string;
  slug: string;
  productGroupId: string;
  cover?: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  categoryId: string;
  brand?: string;
  name: string;
  flavor?: string;
  puffs?: number;
  price: number;
  oldPrice?: number;
  images: string[];
  inStock: boolean;
  stockByShop?: Record<string, number>;
  description?: string;
};

export type Shop = {
  id: string;
  city: string;
  address: string;
  hours: string;
  schedule: string;
  coords?: [number, number];
  cover?: string;
};

export type StockItem = {
  shopId: string;
  quantity: number;
};

export type OrderPayload = {
  items: { productId: string; quantity: number }[];
  shopId: string;
  customer: { name: string; phone: string };
  comment?: string;
};

export type OrderResult = {
  orderId: string;
  total: number;
  status: string;
};

export type ProductsResponse = {
  items: Product[];
  total: number;
};
