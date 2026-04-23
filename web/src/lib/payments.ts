const TOSS_API_BASE = "https://api.tosspayments.com";

function getEncodedKey() {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error("TOSS_SECRET_KEY가 설정되지 않았습니다.");
  return Buffer.from(`${secretKey}:`).toString("base64");
}

interface ConfirmResult {
  success: boolean;
  error?: string;
  payment?: {
    paymentKey: string;
    orderId: string;
    status: string;
    amount: number;
    method: string;
    approvedAt: string;
  };
}

export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<ConfirmResult> {
  try {
    const response = await fetch(`${TOSS_API_BASE}/v1/payments/confirm`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${getEncodedKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || "결제 확인 중 오류가 발생했습니다.",
      };
    }

    const data = await response.json();

    if (data.status !== "DONE") {
      return {
        success: false,
        error: `결제 상태가 올바르지 않습니다: ${data.status}`,
      };
    }

    if (data.totalAmount !== amount) {
      return {
        success: false,
        error: "결제 금액이 일치하지 않습니다.",
      };
    }

    return {
      success: true,
      payment: {
        paymentKey: data.paymentKey,
        orderId: data.orderId,
        status: "paid",
        amount: data.totalAmount,
        method: data.method,
        approvedAt: data.approvedAt,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "결제 확인 중 오류가 발생했습니다.",
    };
  }
}
