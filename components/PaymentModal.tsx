'use client';
import { useEffect, useRef, useState } from 'react';
import { LocaleData, Locale } from '@/lib/i18n';

interface Props { service: 1 | 2 | 3; t: LocaleData; locale: Locale; onClose: () => void; onSuccess: () => void; }
const copy = {
  ko: { close:'닫기', pay:'테스트 결제하기', unavailable:'결제 준비 중', note:'현재 테스트 모드입니다. 실제 금액이 청구되지 않습니다.', notReady:'상점의 테스트 결제 키 연결을 준비하고 있습니다. 지금은 무료 체험으로 둘러보세요.', once:'일회성 결제 · 자동 갱신 없음', monthly:'1개월 이용 · 자동 갱신 없음', lifetime:'평생 이용 상품 · 일회성 결제', total:'결제 예정 금액', includes:'포함 혜택', demo:'먼저 무료로 체험하기', error:'결제창을 열지 못했습니다. 잠시 후 다시 시도해 주세요.', safety:'결제 금액은 서버에서 확인합니다. PDF 전체 보고서 포함.', pending:'결제창을 여는 중…', intro:'나를 알아가는 시간, 지금 시작해요.', subscription:'월 10,000원 정기 구독은 자동 결제·해지 기능 준비 후 제공됩니다.' },
  en: { close:'Close', pay:'Open test checkout', unavailable:'Checkout coming soon', note:'Test mode. No real money is charged.', notReady:'Checkout is being configured. Explore the free demo for now.', once:'One-time payment · No auto-renewal', monthly:'One month · No auto-renewal', lifetime:'Lifetime product · One-time payment', total:'Order total', includes:'What is included', demo:'Try the free demo first', error:'Unable to open checkout. Please try again.', safety:'Server-verified amount. Full PDF report included.', pending:'Opening checkout…', intro:'Your next chapter starts with you.', subscription:'Monthly subscription will be available after recurring billing and cancellation are configured.' },
  ja: { close:'閉じる', pay:'テスト決済へ', unavailable:'決済準備中', note:'テストモードです。実際の請求はありません。', notReady:'決済を準備しています。無料デモをお試しください。', once:'一回払い・自動更新なし', monthly:'1か月・自動更新なし', lifetime:'生涯利用商品・一回払い', total:'合計金額', includes:'含まれる内容', demo:'まずは無料体験', error:'決済を開けませんでした。再度お試しください。', safety:'金額はサーバーで確認。完全版PDF付き。', pending:'決済を開いています…', intro:'自分を知る、新しい一歩。', subscription:'月額プランは定期決済と解約機能の準備後に提供します。' },
  zh: { close:'关闭', pay:'打开测试支付', unavailable:'支付准备中', note:'当前为测试模式，不会实际扣款。', notReady:'支付正在配置中，欢迎先体验免费演示。', once:'一次性付款 · 不自动续费', monthly:'一个月 · 不自动续费', lifetime:'终身产品 · 一次性付款', total:'订单总额', includes:'包含内容', demo:'先免费体验', error:'无法打开支付，请稍后重试。', safety:'服务器验证金额，包含完整版PDF。', pending:'正在打开支付…', intro:'从了解自己开始新的篇章。', subscription:'月度订阅将在自动扣款和取消功能就绪后提供。' },
  tw: { close:'關閉', pay:'開啟測試付款', unavailable:'付款準備中', note:'目前為測試模式，不會實際扣款。', notReady:'付款正在設定中，歡迎先體驗免費示範。', once:'一次性付款 · 不自動續費', monthly:'一個月 · 不自動續費', lifetime:'終身產品 · 一次性付款', total:'訂單總額', includes:'包含內容', demo:'先免費體驗', error:'無法開啟付款，請稍後重試。', safety:'伺服器驗證金額，包含完整版PDF。', pending:'正在開啟付款…', intro:'從了解自己開始新的篇章。', subscription:'月度訂閱將在自動扣款和取消功能就緒後提供。' },
};

async function openToss(service: number) {
  const response = await fetch('/api/payments/order', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ service }) });
  if (!response.ok) throw new Error('ORDER_FAILED');
  const order = await response.json();
  if (!(window as any).TossPayments) {
    await new Promise<void>((resolve,reject)=>{const script=document.createElement('script');script.src='https://js.tosspayments.com/v2/standard';script.onload=()=>resolve();script.onerror=()=>reject(new Error('SDK_FAILED'));document.head.appendChild(script);});
  }
  const toss = (window as any).TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
  await toss.payment({ customerKey:order.customerKey }).requestPayment({ method:'CARD', amount:{currency:'KRW',value:order.amount}, orderId:order.orderId, orderName:order.orderName, successUrl:`${window.location.origin}/payment/success`, failUrl:`${window.location.origin}/payment/fail`, card:{ flowMode:'DEFAULT' } });
}

export default function PaymentModal({service,t,locale,onClose,onSuccess}:Props) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const ref=useRef<HTMLDivElement>(null);
  const c=copy[locale];
  const product=[t.pricing.service1,t.pricing.service2,t.pricing.service3][service-1];
  const domestic=locale==='ko';
  const ready=domestic && Boolean(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.startsWith('test_'));
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement | null;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';ref.current?.focus();
    function keydown(e:KeyboardEvent){if(e.key==='Escape'&&!busy)onClose();if(e.key==='Tab'){const els=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]');if(!els?.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
    document.addEventListener('keydown',keydown);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keydown);previous?.focus();};
  },[onClose,busy]);
  async function pay(){setError('');setBusy(true);try{await openToss(service);}catch{setError(c.error);}finally{setBusy(false);}}
  return <div className="checkout-overlay" onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><div className="checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title" tabIndex={-1} ref={ref}>
    <button className="close-button" aria-label={c.close} onClick={onClose} disabled={busy}>×</button><span className="eyebrow">THE SAJU · CHECKOUT</span><h2 id="checkout-title">{c.intro}</h2>
    <div className="checkout-row"><strong>{product.name}</strong><span>✦</span></div><p className="checkout-note">{service===2?c.monthly:service===3?c.lifetime:c.once}</p>
    <div className="checkout-row"><span>{c.total}</span><strong className="checkout-price">{product.price}</strong></div>
    <h3 className="text-sm text-saju-gold mt-6 mb-3">{c.includes}</h3><ul className="text-sm text-gray-300 space-y-3">{product.features.slice(0,4).map(f=><li key={f}>✓ {f}</li>)}</ul>
    <button className="primary-action" disabled={!ready||busy} onClick={pay}>{busy?c.pending:ready?c.pay:c.unavailable}<span>↗</span></button>
    <p className="checkout-note">{ready?c.note:c.notReady}</p>{service===2&&<p className="checkout-note">{c.subscription}</p>}
    {error&&<p role="alert" className="text-red-300 text-sm mt-4">{error}</p>}
    <button onClick={onSuccess} disabled={busy} className="w-full mt-5 py-4 rounded-2xl border border-saju-border text-gray-300 text-sm">{c.demo} →</button>
    <p className="checkout-note">{c.safety}</p>
  </div></div>;
}
