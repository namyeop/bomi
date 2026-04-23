import { redirect } from "next/navigation";
import { confirmPayment } from "@/lib/payments";
import { PaymentResult } from "@/components/PaymentResult";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "결제 완료 — 보미 (Bomi)",
};

interface SearchParams {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { paymentKey, orderId, amount } = params;

  if (!paymentKey || !orderId || !amount) {
    redirect("/pricing");
  }

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount)) {
    redirect("/pricing");
  }

  const result = await confirmPayment(paymentKey, orderId, parsedAmount);

  if (!result.success) {
    return (
      <PaymentResult
        success={false}
        title="결제 처리 실패"
        description={result.error || "결제 확인 중 오류가 발생했습니다."}
        linkHref="/pricing"
        linkLabel="다시 시도하기"
      />
    );
  }

  return (
    <PaymentResult
      success={true}
      title="결제 완료!"
      description="보미와의 매일 대화가 시작됩니다."
      linkHref="/start"
      linkLabel="보미와 대화하기"
    />
  );
}
