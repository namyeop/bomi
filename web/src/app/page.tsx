import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "보미 (Bomi) — 영어가 무서운 아이도 편하게 말하는 AI 친구",
  description:
    "선생님 앞에서 얼어붙는 아이도, 귀여운 여우 친구 보미한테는 영어로 말해요. 매일 10분 음성 대화.",
};

export default function WelcomePage() {
  return (
    <main role="main" aria-label="보미 소개">
      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-12 max-w-[520px] mx-auto">
        <p
          className="text-sm font-medium tracking-wide uppercase"
          style={{ color: "var(--bomi-orange)" }}
        >
          AI 영어 대화 친구
        </p>
        <h1
          className="mt-3 font-display font-bold leading-tight"
          style={{ color: "var(--bomi-text)", fontSize: "2rem" }}
        >
          영어가 무서운 아이도,
          <br />
          보미한테는 말해요.
        </h1>
        <p
          className="mt-4 text-lg leading-relaxed"
          style={{ color: "var(--bomi-text-muted)" }}
        >
          화상영어 선생님 앞에서 얼어붙는 아이.
          <br />
          귀여운 여우 친구 보미한테는 영어로 말합니다.
        </p>

        <div className="mt-8 flex items-end gap-6">
          <div style={{ animation: "bounce-soft 2s ease-in-out infinite" }}>
            <Image
              src="/bomi-fox.png"
              alt="아기 여우 보미"
              width={180}
              height={180}
              priority
            />
          </div>
          <div className="pb-4 flex flex-col gap-3">
            <Link
              href="/start"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-display font-bold text-white transition-transform hover:scale-105 active:scale-95"
              style={{ background: "var(--bomi-orange)" }}
            >
              무료로 시작하기
            </Link>
            <p
              className="text-xs text-center"
              style={{ color: "var(--bomi-text-muted)" }}
            >
              가입 없이 바로 시작
            </p>
          </div>
        </div>
      </section>

      {/* ── 이렇게 작동해요 ── */}
      <section
        className="px-6 py-12"
        style={{ background: "var(--bomi-surface)" }}
      >
        <div className="max-w-[520px] mx-auto">
          <h2
            className="text-xl font-display font-bold"
            style={{ color: "var(--bomi-text)" }}
          >
            이렇게 작동해요
          </h2>

          <ol className="mt-8 space-y-8">
            <li className="flex gap-4">
              <span
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "var(--bomi-orange)" }}
              >
                1
              </span>
              <div>
                <p className="font-bold" style={{ color: "var(--bomi-text)" }}>
                  링크를 열고 마이크를 허용하세요
                </p>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: "var(--bomi-text-muted)" }}
                >
                  앱 설치 없이 브라우저에서 바로 시작합니다.
                  아이에게 폰을 건네주세요.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "var(--bomi-orange)" }}
              >
                2
              </span>
              <div>
                <p className="font-bold" style={{ color: "var(--bomi-text)" }}>
                  보미가 영어로 말을 걸어요
                </p>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: "var(--bomi-text-muted)" }}
                >
                  &ldquo;Hey! I&apos;m Bomi! What did you do today?&rdquo;
                  <br />
                  아이 눈높이에서 친구처럼 대화합니다.
                  선생님이 아니라 친구라서 긴장하지 않아요.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "var(--bomi-orange)" }}
              >
                3
              </span>
              <div>
                <p className="font-bold" style={{ color: "var(--bomi-text)" }}>
                  대화가 끝나면 리포트를 받아보세요
                </p>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: "var(--bomi-text-muted)" }}
                >
                  아이가 영어로 한 말, 사용한 표현, 보미의 평가를
                  부모님께 보여드립니다.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ── 왜 보미인가요 ── */}
      <section className="px-6 py-12">
        <div className="max-w-[520px] mx-auto">
          <h2
            className="text-xl font-display font-bold"
            style={{ color: "var(--bomi-text)" }}
          >
            화상영어와 뭐가 다른가요?
          </h2>

          <div className="mt-8 space-y-6">
            <div>
              <p className="font-bold" style={{ color: "var(--bomi-text)" }}>
                아이가 먼저 말해요
              </p>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--bomi-text-muted)" }}
              >
                선생님 앞에서는 &ldquo;몰라요&rdquo;만 반복하던 아이가,
                보미한테는 &ldquo;I like pizza!&rdquo;를 외칩니다.
                캐릭터 친구라서 틀려도 부끄럽지 않아요.
              </p>
            </div>

            <div>
              <p className="font-bold" style={{ color: "var(--bomi-text)" }}>
                진짜 음성 대화예요
              </p>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--bomi-text-muted)" }}
              >
                버튼을 누르거나 객관식을 고르는 게 아닙니다.
                아이가 말하면 보미가 듣고, 이해하고, 대답합니다.
                실제 대화를 주고받아요.
              </p>
            </div>

            <div>
              <p className="font-bold" style={{ color: "var(--bomi-text)" }}>
                매일 할 수 있어요
              </p>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--bomi-text-muted)" }}
              >
                화상영어는 주 2-3회, 예약 필수.
                보미는 매일 아무때나 10분.
                꾸준한 영어 노출이 실력을 만듭니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 부모님이 궁금한 것들 ── */}
      <section
        className="px-6 py-12"
        style={{ background: "var(--bomi-surface)" }}
      >
        <div className="max-w-[520px] mx-auto">
          <h2
            className="text-xl font-display font-bold"
            style={{ color: "var(--bomi-text)" }}
          >
            부모님이 궁금한 것들
          </h2>

          <dl className="mt-8 space-y-6">
            <div>
              <dt className="font-bold" style={{ color: "var(--bomi-text)" }}>
                AI가 아이한테 안전한가요?
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--bomi-text-muted)" }}
              >
                보미는 아이 전용으로 설계됐습니다.
                부적절한 내용은 차단되고, 대화는 영어 학습 주제로 제한됩니다.
                아이의 음성 데이터는 저장하지 않습니다.
              </dd>
            </div>

            <div>
              <dt className="font-bold" style={{ color: "var(--bomi-text)" }}>
                영어를 아예 못하는 아이도 되나요?
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--bomi-text-muted)" }}
              >
                네. 보미는 아이의 수준에 맞춰 대화합니다.
                한국어로 말해도 보미가 영어로 자연스럽게 이끌어줘요.
                &ldquo;Hello&rdquo; 한마디부터 시작할 수 있습니다.
              </dd>
            </div>

            <div>
              <dt className="font-bold" style={{ color: "var(--bomi-text)" }}>
                어떤 기기에서 되나요?
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--bomi-text-muted)" }}
              >
                스마트폰, 태블릿, PC 모두 가능합니다.
                앱 설치 없이 링크만 열면 됩니다.
                마이크가 있는 기기면 어디서든 할 수 있어요.
              </dd>
            </div>

            <div>
              <dt className="font-bold" style={{ color: "var(--bomi-text)" }}>
                비용이 얼마인가요?
              </dt>
              <dd
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--bomi-text-muted)" }}
              >
                지금은 무료로 체험할 수 있습니다.
                카드 등록도 필요 없어요.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="px-6 py-16">
        <div className="max-w-[520px] mx-auto text-center">
          <Image
            src="/bomi-fox.png"
            alt="아기 여우 보미"
            width={120}
            height={120}
            className="mx-auto"
          />
          <p
            className="mt-6 text-xl font-display font-bold"
            style={{ color: "var(--bomi-text)" }}
          >
            아이가 영어로 말하는 모습,
            <br />
            직접 확인해보세요.
          </p>
          <Link
            href="/start"
            className="mt-6 inline-flex items-center justify-center px-10 py-5 rounded-full text-xl font-display font-bold text-white transition-transform hover:scale-105 active:scale-95"
            style={{ background: "var(--bomi-orange)" }}
          >
            무료로 시작하기
          </Link>
          <p
            className="mt-3 text-xs"
            style={{ color: "var(--bomi-text-muted)" }}
          >
            가입 없이 바로 시작 · 언제든 종료 가능
          </p>
        </div>
      </section>
    </main>
  );
}
