import { createHmac, timingSafeEqual } from 'crypto';
import { EDITIONS } from './catalog';

// A single server-side catalogue: the browser never decides the amount charged.
export const PRODUCTS = {
  1: { amount: 10000, name: 'THE SAJU 인생 사주 리포트' },
  2: { amount: 30000, name: 'THE SAJU 월별 일일 운세 (1개월)' },
  3: { amount: 200000, name: 'THE SAJU 평생 이용권' },
  4: {amount:EDITIONS[4].amount,name:EDITIONS[4].title[0]},
  5: {amount:EDITIONS[5].amount,name:EDITIONS[5].title[0]},
  6: {amount:EDITIONS[6].amount,name:EDITIONS[6].title[0]},
  7: {amount:EDITIONS[7].amount,name:EDITIONS[7].title[0]},
  8: {amount:EDITIONS[8].amount,name:EDITIONS[8].title[0]},
} as const;
export type ProductId = keyof typeof PRODUCTS;
export type Order = { orderId: string; service: ProductId; amount: number; expires: number };

export function signOrder(order: Order): string {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error('PAYMENT_NOT_CONFIGURED');
  const payload = Buffer.from(JSON.stringify(order)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

export function readOrder(value: string | undefined): Order | null {
  if (!value || !process.env.TOSS_SECRET_KEY) return null;
  try {
    const [payload, signature] = value.split('.');
    const expected = createHmac('sha256', process.env.TOSS_SECRET_KEY).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const order = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Order;
    if (order.expires < Date.now() || !PRODUCTS[order.service] || order.amount !== PRODUCTS[order.service].amount) return null;
    return order;
  } catch { return null; }
}

export function sameOrigin(req: Request): boolean {
  try {
    const origin = new URL(req.headers.get('origin') || '');
    const host = req.headers.get('host') || new URL(req.url).host;
    return (origin.protocol === 'https:' || origin.protocol === 'http:') && origin.host === host;
  } catch { return false; }
}
