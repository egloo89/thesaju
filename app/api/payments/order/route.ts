import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { PRODUCTS, ProductId, signOrder, sameOrigin } from '@/lib/payments';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'INVALID_ORIGIN' }, { status: 403 });
  // Test only until persistent orders, customer accounts, refunds and billing are configured.
  if (!process.env.TOSS_SECRET_KEY?.startsWith('test_sk_') || !process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.startsWith('test_ck_')) {
    return NextResponse.json({ error: 'TEST_PAYMENT_NOT_CONFIGURED' }, { status: 503 });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 }); }
  const service = Number(body.service) as ProductId;
  const product = PRODUCTS[service];
  if (!product) return NextResponse.json({ error: 'INVALID_PRODUCT' }, { status: 400 });
  const order = { orderId: `saju_${randomUUID()}`, service, amount: product.amount, expires: Date.now() + 30 * 60000 };
  const response = NextResponse.json({ orderId: order.orderId, amount: order.amount, orderName: product.name, customerKey: `guest_${randomUUID()}` });
  response.cookies.set('saju_pending_order', signOrder(order), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 1800 });
  return response;
}
