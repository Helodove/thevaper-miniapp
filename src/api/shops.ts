import { apiGet } from './client';
import type { Shop } from './types';

export const getShops = (): Promise<Shop[]> => apiGet<Shop[]>('/shops');
