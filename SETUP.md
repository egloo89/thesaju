# THE SAJU — 설치 및 배포 가이드

## 1. 사전 준비

### Node.js 설치 (필수)
https://nodejs.org 에서 LTS 버전 다운로드 및 설치

### 패키지 설치
```bash
cd the-saju
npm install
```

---

## 2. 환경변수 설정

`.env.local.example` 파일을 `.env.local` 로 복사 후 값 입력:

```bash
copy .env.local.example .env.local
```

### OpenAI API (AI 해석 엔진)
- https://platform.openai.com 에서 API 키 발급
- `gpt-4o-mini` 사용 (저렴하고 충분히 좋음)
- 없어도 데모 모드로 작동함

### TossPayments (국내 결제)
1. https://developers.tosspayments.com 회원가입
2. 테스트 클라이언트 키 / 시크릿 키 발급
3. 결제 연동 코드: `components/PaymentModal.tsx` 의 `handleTossPayment` 함수 수정

```typescript
// TossPayments SDK 설치
npm install @tosspayments/tosspayments-sdk

// PaymentModal.tsx 에 추가
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

async function handleTossPayment() {
  const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
  const payment = tossPayments.payment({ customerKey: 'user-unique-id' });
  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: 10000 },
    orderId: `order-${Date.now()}`,
    orderName: 'THE SAJU 인생 사주 리포트',
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
}
```

### LemonSqueezy (해외 결제)
1. https://app.lemonsqueezy.com 회원가입
2. Store 생성 후 Products 3개 만들기:
   - Service 1: $8 (one-time)
   - Service 2: $22 (one-time) + $8/month (subscription)
   - Service 3: $149 (one-time)
3. 각 상품의 Checkout URL을 `.env.local` 에 입력

**LemonSqueezy 지원 결제수단:**
- 신용카드 (Visa, Mastercard, Amex)
- PayPal
- LINE Pay (일본)
- Alipay (중국)
- 기타 지역별 결제수단

---

## 3. 로컬 개발 서버

```bash
npm run dev
```
→ http://localhost:3000 에서 확인

---

## 4. Vercel 배포

### 방법 1: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 방법 2: GitHub 연동
1. https://github.com 에 저장소 생성 및 push
2. https://vercel.com 에서 "Import Project"
3. 환경변수 설정 (Vercel Dashboard → Settings → Environment Variables)
4. 자동 배포 완료

### Vercel 환경변수 설정
Dashboard → Project → Settings → Environment Variables 에서:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- `TOSS_SECRET_KEY`
- `NEXT_PUBLIC_LS_CHECKOUT_1` ~ `_3`
- `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app`

---

## 5. 아이콘 생성

```bash
# sharp 설치
npm install sharp

# 스크립트로 아이콘 생성
node scripts/generate-icons.js
```

또는 https://realfavicongenerator.net 에서 SVG 업로드 후 자동 생성

---

## 6. 만세력 엔진 개선

현재 구현은 근사값 기반입니다. 더 정확한 만세력을 위해:

### 오픈소스 참고
- https://github.com/NovaBomb/saju (한국어)
- https://github.com/lunarphp/saju
- 절기 데이터 DB 구축 (1900~2100년 절입일 데이터)

### 절기 데이터 통합
`lib/saju/solarTerms.ts` 에 연도별 절기 데이터 추가:
```typescript
export const SOLAR_TERMS: Record<number, number[][]> = {
  1990: [[1,6],[2,4],[3,6],...], // 월별 절입일
  ...
};
```

---

## 7. 수익 구조 분석

| 서비스 | 가격 | API 비용 | 마진 |
|--------|------|----------|------|
| 사주 리포트 | ₩10,000 | ≈₩50~200 | ~98% |
| 월별 운세 | ₩30,000 | ≈₩100~400 | ~99% |
| 평생 이용권 | ₩200,000 | 사용량 기반 | ~95%+ |

GPT-4o-mini 비용: 입력 $0.15/1M tokens, 출력 $0.60/1M tokens
→ 사주 해석 1건 당 약 $0.01~0.03 (한화 15~45원)

---

## 8. 국가별 가격 정책 권장

| 국가 | 서비스1 | 서비스2 | 평생 |
|------|---------|---------|------|
| 한국 | ₩10,000 | ₩30,000 | ₩200,000 |
| 미국 | $8 | $22 | $149 |
| 일본 | ¥1,200 | ¥3,500 | ¥22,000 |
| 중국 | ¥58 | ¥168 | ¥1,280 |
| 대만 | NT$280 | NT$880 | NT$5,800 |

*구매력 평가(PPP) 기반 조정 권장

---

## 9. 추후 개발 로드맵

- [ ] 사용자 계정 (NextAuth.js)
- [ ] 결과 저장 및 히스토리
- [ ] 합궁 분석 (궁합)
- [ ] 이름 작명 서비스
- [ ] 밀어붙이기 알림 (운세 알림)
- [ ] 더 정밀한 만세력 (절기 DB 구축)
- [ ] KakaoTalk 채널 연동
