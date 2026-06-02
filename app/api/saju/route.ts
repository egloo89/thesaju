import { NextRequest, NextResponse } from 'next/server';
import { calculateSaju } from '@/lib/saju/engine';

export const dynamic = 'force-dynamic';

const cache = new Map<string, { result: ReturnType<typeof calculateSaju>; ts: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, month, day, hour, gender, timeUnknown, calendarType, isLeapMonth } = body;

    if (!year || !month || !day || !gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cacheKey = `${year}-${month}-${day}-${hour ?? 'x'}-${gender}-${timeUnknown}-${calendarType ?? 'solar'}-${isLeapMonth ? 'L' : ''}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 3600000) {
      return NextResponse.json({ saju: cached.result, id: cacheKey });
    }

    const result = calculateSaju({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: timeUnknown ? undefined : Number(hour),
      gender,
      timeUnknown: Boolean(timeUnknown),
      calendarType: calendarType === 'lunar' ? 'lunar' : 'solar',
      isLeapMonth: Boolean(isLeapMonth),
    });

    cache.set(cacheKey, { result, ts: Date.now() });

    return NextResponse.json({ saju: result, id: cacheKey });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
