"use client";

import Image from "next/image";
import { useState } from "react";
import { BomiRoom } from "@/components/BomiRoom";

type AppScreen = "handoff" | "welcome" | "conversation" | "farewell";

interface FarewellData {
  parentReport: string;
}

export default function Home() {
  const [screen, setScreen] = useState<AppScreen>("handoff");
  const [farewellData, setFarewellData] = useState<FarewellData | null>(null);

  // 부모→아이 핸드오프 화면
  if (screen === "handoff") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 max-w-[480px] mx-auto"
        style={{ animation: "fade-in 500ms ease-out" }}
        role="main"
        aria-label="아이에게 전달"
      >
        <div style={{ animation: "bounce-soft 2s ease-in-out infinite" }}>
          <Image src="/bomi-fox.png" alt="아기 여우 보미" width={180} height={180} priority />
        </div>

        <div className="text-center space-y-3">
          <p
            className="text-xl font-display font-bold"
            style={{ color: "var(--bomi-text)" }}
          >
            이제 아이에게 폰을 주세요.
          </p>
          <p
            className="text-lg"
            style={{ color: "var(--bomi-text-muted)" }}
          >
            보미가 영어로 인사할 거예요!
          </p>
        </div>

        <button
          onClick={() => setScreen("welcome")}
          className="px-12 py-5 rounded-full text-2xl font-display font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{ background: "var(--bomi-orange)" }}
          aria-label="준비됐어요"
        >
          준비됐어요!
        </button>
      </main>
    );
  }

  if (screen === "conversation") {
    return (
      <BomiRoom
        onEnd={(report) => {
          setFarewellData({ parentReport: report || "" });
          setScreen("farewell");
        }}
      />
    );
  }

  if (screen === "farewell") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 max-w-[480px] mx-auto"
        style={{ animation: "fade-in 500ms ease-out" }}
        role="main"
        aria-label="대화 종료"
      >
        {/* 보미 작별 */}
        <div style={{ animation: "bounce-soft 2s ease-in-out infinite" }}>
          <Image src="/bomi-fox.png" alt="보미가 인사하고 있어요" width={160} height={160} priority />
        </div>
        <p className="text-2xl font-display font-bold text-center" style={{ color: "var(--bomi-orange)" }}>
          See you tomorrow! Bye bye!
        </p>

        {/* 부모 리포트 카드 */}
        {farewellData?.parentReport && (
          <div
            className="w-full rounded-2xl p-6 space-y-4"
            style={{
              background: "var(--bomi-surface)",
              borderRadius: "var(--bomi-radius-md)",
              animation: "fade-in 500ms ease-out 300ms both",
            }}
          >
            <h2 className="text-xl font-bold" style={{ color: "var(--bomi-text)" }}>
              오늘의 대화 리포트
            </h2>
            {farewellData.parentReport.split("\n").filter(Boolean).map((line, i) => {
              const isQuote = line.includes("대표 문장:");
              const isBomiComment = line.includes("보미의 한마디:");
              return (
                <p
                  key={i}
                  className={`text-base leading-relaxed ${isQuote ? "text-lg font-display font-bold" : ""}`}
                  style={{
                    color: isQuote
                      ? "var(--bomi-orange)"
                      : isBomiComment
                        ? "var(--bomi-text)"
                        : "var(--bomi-text-muted)",
                  }}
                >
                  {line}
                </p>
              );
            })}
          </div>
        )}

        <button
          onClick={() => {
            setFarewellData(null);
            setScreen("welcome");
          }}
          className="px-10 py-4 rounded-full text-xl font-display font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{ background: "var(--bomi-orange)" }}
          aria-label="처음으로 돌아가기"
        >
          처음으로
        </button>
      </main>
    );
  }

  // Welcome screen
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 max-w-[480px] mx-auto"
      role="main"
      aria-label="보미 시작 화면"
    >
      <div style={{ animation: "bounce-soft 2s ease-in-out infinite" }}>
        <Image src="/bomi-fox.png" alt="아기 여우 보미" width={200} height={200} priority />
      </div>

      <div className="text-center space-y-2">
        <h1
          className="font-display font-bold"
          style={{ color: "var(--bomi-orange)", fontSize: "2.25rem" }}
        >
          Hello, I&apos;m Bomi!
        </h1>
        <p className="text-xl" style={{ color: "var(--bomi-text-muted)" }}>
          나랑 영어로 이야기하자!
        </p>
      </div>

      <button
        onClick={() => setScreen("conversation")}
        className="px-12 py-5 rounded-full text-2xl font-display font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--bomi-orange)" }}
        aria-label="보미와 대화 시작하기"
      >
        Start talking
      </button>
    </main>
  );
}
