# THE SAJU character-led redesign

- Young adult original AI guide characters Yoon / Seoha; choice saved locally.
- Responsive editorial landing, compact service cards, reading overview, expandable full interpretations, accessible checkout sheet.
- Same typography and character-led cover for full and monthly PDFs. Full text remains in downloaded reports.
- All new primary copy supports ko/en/ja/zh/tw. Existing profile interpretation generation remains separate from template localization.

## Payment readiness

This release supports **Toss test payments only**. Register `NEXT_PUBLIC_TOSS_CLIENT_KEY` and `TOSS_SECRET_KEY` securely on Vercel, using matching test API keys from the same shop. Redeploy after changing the public client key.
Use the API individual integration pair (`test_ck_...` / `test_sk_...`) for the current `.payment()` SDK implementation, not the `gck` / `gsk` widget or documentation examples. On Vercel the public client variable must be **Config**; the server-only secret variable must be **Secret**. Do not remove `NEXT_PUBLIC_` from the client variable name.

Prices are defined on the server in `lib/payments.ts`: KRW 10,000 (full report), 30,000 (one month), 200,000 (lifetime product). The KRW 10,000 monthly subscription is explicitly marked coming soon; it is not a one-time payment disguised as recurring billing.

The checkout issues a signed, HttpOnly, short-lived order cookie, verifies amount/order before calling Toss, and uses an idempotency key. A test receipt cookie enables return navigation. It does **not** implement production entitlement storage, account recovery, refunds, webhook processing or recurring billing. Live keys are deliberately rejected until those are implemented. Free demo access is not proof of a paid order. Current legacy interpretation endpoints are not payment-gated; do not enable live charging until durable entitlements and access checks exist.

## Art assets

Generated using the built-in image generation tool. Original character prompt: young adult Korean male/female webtoon reading guides, minimal modern navy/ivory hanbok, fine gold trim, welcoming pose holding a book, transparent background, no text, no existing brand likeness. Youth revision: 21-23-year-old adult, fresh expression and minimal ornamentation.

Assets: `public/images/guide-yoon.png`, `public/images/guide-seoha.png`.
Optimized WebP delivery variants are used in the site and PDFs (approximately 106 KB and 143 KB respectively), preserving transparency. Original PNG assets are retained.

## Local checks

`npx tsc --noEmit`

`npx tsc lib/payments.ts --outDir tmp/payment-tests --module commonjs --target es2020 --esModuleInterop --skipLibCheck`

`node --test tests/payment-order.test.cjs`

`npm run build`
