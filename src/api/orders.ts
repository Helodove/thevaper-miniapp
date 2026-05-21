import { apiPost } from './client';
import type { OrderPayload, OrderResult } from './types';

export const createOrder = (payload: OrderPayload): Promise<OrderResult> =>
  apiPost<OrderResult>('/orders', payload);
