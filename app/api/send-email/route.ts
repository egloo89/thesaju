import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const { email, pdfBase64, filename, birthDate } = await req.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
    }
    if (!pdfBase64) {
      return NextResponse.json({ error: 'NO_PDF' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromAddr = process.env.EMAIL_FROM || 'THE SAJU <onboarding@resend.dev>';

    // 이메일 서비스 미설정 시 데모 응답
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        demo: true,
        message: '이메일 서비스(RESEND_API_KEY)가 설정되지 않아 데모 모드로 처리되었습니다. 실제 발송을 위해 환경변수를 설정하세요.',
      });
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#E8E8F0;padding:32px;border-radius:12px">
        <div style="text-align:center;border-bottom:2px solid #C9A84C66;padding-bottom:20px;margin-bottom:24px">
          <div style="font-size:28px;font-weight:bold;color:#C9A84C;letter-spacing:4px">THE SAJU</div>
          <div style="font-size:11px;color:#C9A84C99;letter-spacing:3px;margin-top:6px">四柱命理 · TRADITIONAL KOREAN FORTUNE REPORT</div>
        </div>
        <p style="color:#E8E8F0;font-size:15px;line-height:1.7">
          안녕하세요, <strong>THE SAJU</strong>입니다.<br/><br/>
          요청하신 <strong>종합 사주 분석 보고서 (FULL VERSION)</strong>를 첨부 파일로 보내드립니다.<br/>
          ${birthDate ? `· 분석 기준: ${birthDate}<br/>` : ''}
          첨부된 PDF에서 사주팔자 명식, 오행 균형, 행운 가이드, 길흉 가이드, 14가지 종합 운세,
          인생 시기별 운세, 10년 대운 전환 전략까지 모두 확인하실 수 있습니다.
        </p>
        <div style="margin-top:24px;text-align:center">
          <a href="https://thesaju-boostweb.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E8C97A);color:#0A0A0F;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:10px">다시 보기 →</a>
        </div>
        <div style="text-align:center;color:#6B6B80;font-size:11px;margin-top:28px;border-top:1px solid #2A2A3E;padding-top:16px">
          본 보고서는 전통 만세력 계산과 명리학 해석에 기반합니다 · thesaju-boostweb.vercel.app
        </div>
      </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddr,
        to: [email],
        subject: '[THE SAJU] 요청하신 종합 사주 분석 보고서입니다 🔮',
        html,
        attachments: [
          {
            filename: filename || 'THE-SAJU-Report.pdf',
            content: pdfBase64,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', errText);
      return NextResponse.json({ error: 'SEND_FAILED' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
