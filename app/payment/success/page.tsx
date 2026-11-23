'use client';
import { useEffect, useRef, useState } from 'react';
export default function Success() {
  const ran = useRef(false);
  const [message, setMessage] = useState('테스트 결제를 확인하고 있습니다…');
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const params = new URLSearchParams(window.location.search);
    fetch('/api/payments/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentKey: params.get('paymentKey'), orderId: params.get('orderId'), amount: Number(params.get('amount')) }) })
      .then(async res => { if (!res.ok) throw new Error(); await res.json(); window.location.replace('/?payment=confirmed'); })
      .catch(() => setMessage('결제 확인에 실패했습니다. 중복 결제하지 말고 주문 상태를 확인해 주세요.'));
  }, []);
  return <main className="max-w-lg mx-auto p-8 text-center"><span className="eyebrow">THE SAJU · TEST PAYMENT</span><h1 className="view-title">{message}</h1><a href="/">홈으로 돌아가기</a></main>;
}
