import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "보미 (Bomi) — 영어가 무서운 아이도 편하게 말하는 AI 친구",
  description:
    "선생님 앞에서 얼어붙는 아이도, 귀여운 여우 친구 보미한테는 영어로 말해요. 매일 10분 음성 대화.",
};

export default function WelcomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center px-6 py-12 max-w-[520px] mx-auto"
      role="main"
      aria-label="보미 소개"
    >
      {/* Hero — 한 줄 메시지 */}
      <h1
        className="font-display font-bold text-center leading-snug"
        style={{ color: "var(--bomi-text)", fontSize: "1.75rem" }}
      >
        영어가 무서운 아이도,
        <br />
        <span style={{ color: "var(--bomi-orange)" }}>
          보미한테는 말해요.
        </span>
      </h1>

      {/* 보미 캐릭터 */}
      <div className="mt-8" style={{ animation: "bounce-soft 2s ease-in-out infinite" }}>
        <Image
          src="/bomi-fox.png"
          alt="아기 여우 보미"
          width={220}
          height={220}
          priority
        />
      </div>

      {/* 어떻게 작동하는지 — 3줄 */}
      <ul className="mt-10 w-full space-y-4">
        {[
          { icon: "🎙️", text: "AI와 진짜 음성 대화. 듣고, 말하고, 바로 피드백." },
          { icon: "🦊", text: "선생님이 아니라 친구. 긴장 없이 편하게 말해요." },
          { icon: "⏰", text: "매일 10분, 아이가 영어로 말하는 모습을 보세요." },
        ].map((item) => (
          <li
            key={item.icon}
            className="flex items-start gap-4 rounded-2xl px-5 py-4"
            style={{ background: "var(--bomi-surface)" }}
          >
            <span className="text-2xl shrink-0 mt-0.5" aria-hidden="true">
              {item.icon}
            </span>
            <p
              className="text-base leading-relaxed"
              style={{ color: "var(--bomi-text)" }}
            >
              {item.text}
            </p>
          </li>
        ))}
      </ul>

      {/* 가격 한 줄 */}
      <p
        className="mt-10 text-center text-lg"
        style={{ color: "var(--bomi-text-muted)" }}
      >
        지금 <strong style={{ color: "var(--bomi-orange)" }}>무료</strong>로
        체험할 수 있어요.
      </p>

      {/* CTA 버튼 */}
      <Link
        href="/start"
        className="mt-6 inline-flex items-center justify-center px-12 py-5 rounded-full text-xl font-display font-bold text-white transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--bomi-orange)" }}
        aria-label="무료 체험 시작하기"
      >
        무료로 시작하기
      </Link>

      {/* 신뢰 한 줄 */}
      <p
        className="mt-6 text-sm text-center"
        style={{ color: "var(--bomi-text-muted)" }}
      >
        카드 등록 없이 바로 시작 · 언제든 종료 가능
      </p>
    </main>
  );
}
