import { PaymentResult } from "@/components/PaymentResult";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "결제 실패 — 보미 (Bomi)",
};

interface SearchParams {
  code?: string;
  message?: string;
}

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const message =
    params.message ?? "결제가 취소되었거나 오류가 발생했습니다.";

  return (
    <PaymentResult
      success={false}
      title="결제 실패"
      description={message}
      linkHref="/pricing"
      linkLabel="다시 시도하기"
    />
  );
}
