import { NextRequest, NextResponse } from 'next/server';
import { readOrder } from '@/lib/payments';
export async function GET(req: NextRequest) {
  const order = readOrder(req.cookies.get('saju_test_receipt')?.value);
  return NextResponse.json({ service: order?.service ?? null, test: true }, { headers: { 'Cache-Control': 'no-store' } });
}
