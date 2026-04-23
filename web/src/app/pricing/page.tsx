import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "@/components/CheckoutButton";

const PLAN_PRICE = 9900;
const PLAN_NAME = "보미 매달 이용권";

export const metadata = {
  title: "이용권 — 보미 (Bomi)",
  description: "보미와 매일 영어 대화를 시작하세요.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-[520px] mx-auto">
      {/* Header */}
      <div className="text-center">
        <Image
          src="/bomi-fox.png"
          alt="보미"
          width={100}
          height={100}
          className="mx-auto"
        />
        <h1
          className="mt-6 text-2xl font-display font-bold"
          style={{ color: "var(--bomi-text)" }}
        >
          보미와 매일 대화하세요
        </h1>
        <p
          className="mt-2 text-lg"
          style={{ color: "var(--bomi-text-muted)" }}
        >
          아이의 영어가 자라납니다
        </p>
      </div>

      {/* Plans */}
      <div className="mt-12 space-y-6">
        {/* Free */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--bomi-surface)" }}
        >
          <div className="flex items-baseline justify-between">
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--bomi-text)" }}
            >
              무료 체험
            </h3>
            <p
              className="text-2xl font-display font-bold"
              style={{ color: "var(--bomi-text)" }}
            >
              ₩0
            </p>
          </div>
          <ul
            className="mt-4 space-y-2 text-base"
            style={{ color: "var(--bomi-text-muted)" }}
          >
            <li>✓ 하루 1회 대화</li>
            <li>✓ 기본 리포트</li>
          </ul>
          <Link
            href="/start"
            className="mt-6 w-full inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-display font-bold transition-transform hover:scale-105 active:scale-95"
            style={{
              border: "2px solid var(--bomi-orange)",
              color: "var(--bomi-orange)",
            }}
          >
            무료로 시작하기
          </Link>
        </div>

        {/* Paid */}
        <div
          className="rounded-2xl p-6 relative"
          style={{
            background: "var(--bomi-surface)",
            border: "2px solid var(--bomi-orange)",
          }}
        >
          <span
            className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: "var(--bomi-orange)" }}
          >
            추천
          </span>
          <div className="flex items-baseline justify-between">
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--bomi-text)" }}
            >
              매달 이용권
            </h3>
            <div className="text-right">
              <p
                className="text-2xl font-display font-bold"
                style={{ color: "var(--bomi-orange)" }}
              >
                ₩{PLAN_PRICE.toLocaleString()}
                <span
                  className="text-sm font-normal"
                  style={{ color: "var(--bomi-text-muted)" }}
                >
                  /월
                </span>
              </p>
            </div>
          </div>
          <ul
            className="mt-4 space-y-2 text-base"
            style={{ color: "var(--bomi-text-muted)" }}
          >
            <li>✓ 매일 무제한 대화</li>
            <li>✓ 상세 대화 리포트</li>
            <li>✓ 아이 수준 맞춤 대화</li>
          </ul>
          <div className="mt-6">
            <CheckoutButton amount={PLAN_PRICE} orderName={PLAN_NAME} />
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p
        className="mt-8 text-center text-sm"
        style={{ color: "var(--bomi-text-muted)" }}
      >
        결제 후 언제든 해지할 수 있어요
      </p>

      {/* Back to home */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm underline"
          style={{ color: "var(--bomi-text-muted)" }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
