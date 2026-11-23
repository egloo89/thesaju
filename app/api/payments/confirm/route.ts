import { NextRequest, NextResponse } from 'next/server';
import { readOrder, sameOrigin, signOrder } from '@/lib/payments';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: 'INVALID_ORIGIN' }, { status: 403 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 }); }
  const order = readOrder(req.cookies.get('saju_pending_order')?.value);
  if (!order || body.orderId !== order.orderId || Number(body.amount) !== order.amount || typeof body.paymentKey !== 'string' || body.paymentKey.length > 200) {
    return NextResponse.json({ error: 'INVALID_ORDER' }, { status: 400 });
  }
  if (!process.env.TOSS_SECRET_KEY?.startsWith('test_sk_')) return NextResponse.json({ error: 'TEST_PAYMENT_ONLY' }, { status: 503 });
  try {
    const upstream = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')}`, 'Content-Type': 'application/json', 'Idempotency-Key': order.orderId },
      body: JSON.stringify({ paymentKey: body.paymentKey, orderId: order.orderId, amount: order.amount }),
      signal: AbortSignal.timeout(20000),
    });
    const result = await upstream.json();
    if (!upstream.ok || result.status !== 'DONE' || result.orderId !== order.orderId || result.totalAmount !== order.amount) {
      return NextResponse.json({ error: 'PAYMENT_CONFIRMATION_FAILED' }, { status: 400 });
    }
    const response = NextResponse.json({ service: order.service, test: true });
    response.cookies.set('saju_test_receipt', signOrder({ ...order, expires: Date.now() + 86400000 }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 86400 });
    response.cookies.delete('saju_pending_order');
    return response;
  } catch { return NextResponse.json({ error: 'PAYMENT_UNAVAILABLE' }, { status: 502 }); }
}
