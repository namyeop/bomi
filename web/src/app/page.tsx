"use client";

import { useState } from "react";
import { BomiRoom } from "@/components/BomiRoom";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <BomiRoom onEnd={() => setStarted(false)} />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {/* 보미 캐릭터 */}
      <div className="text-[120px] leading-none" style={{ animation: "bounce-soft 2s ease-in-out infinite" }}>
        🦊
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold" style={{ color: "var(--bomi-orange)" }}>
          안녕! 나는 보미!
        </h1>
        <p className="text-xl text-gray-600">
          나랑 영어로 이야기하자!
        </p>
      </div>

      <button
        onClick={() => setStarted(true)}
        className="px-12 py-5 rounded-full text-2xl font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--bomi-orange)" }}
      >
        대화 시작하기
      </button>
    </main>
  );
}
