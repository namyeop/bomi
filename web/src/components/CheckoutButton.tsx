"use client";

import { useState } from "react";

interface CheckoutButtonProps {
  amount: number;
  orderName: string;
}

export function CheckoutButton({ amount, orderName }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  async function handlePayment() {
    if (!clientKey) {
      alert("결제 기능이 아직 설정되지 않았습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const { loadTossPayments, ANONYMOUS } = await import(
        "@tosspayments/tosspayments-sdk"
      );
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      const orderId = `bomi-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payments/success?amount=${amount}`,
        failUrl: `${window.location.origin}/payments/fail`,
      });
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !clientKey}
      className="w-full px-8 py-4 rounded-full text-lg font-display font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: "var(--bomi-orange)" }}
    >
      {isLoading ? "결제 준비 중..." : `₩${amount.toLocaleString()} 결제하기`}
    </button>
  );
}
