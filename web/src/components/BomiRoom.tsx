"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useCallback, useEffect, useState } from "react";

interface BomiRoomProps {
  onEnd: () => void;
}

export function BomiRoom({ onEnd }: BomiRoomProps) {
  const [connectionDetails, setConnectionDetails] = useState<{
    token: string;
    wsUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/token")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setConnectionDetails({ token: data.token, wsUrl: data.wsUrl });
      })
      .catch(() => setError("서버에 연결할 수 없어요"));
  }, []);

  const handleDisconnected = useCallback(() => {
    onEnd();
  }, [onEnd]);

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-6xl">😢</div>
        <p className="text-xl text-gray-600">{error}</p>
        <button
          onClick={onEnd}
          className="px-8 py-3 rounded-full text-lg font-bold text-white cursor-pointer"
          style={{ background: "var(--bomi-orange)" }}
        >
          돌아가기
        </button>
      </main>
    );
  }

  if (!connectionDetails) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div
          className="text-[80px] leading-none"
          style={{ animation: "bounce-soft 1s ease-in-out infinite" }}
        >
          🦊
        </div>
        <p className="text-xl text-gray-500">보미를 만나는 중...</p>
      </main>
    );
  }

  return (
    <LiveKitRoom
      token={connectionDetails.token}
      serverUrl={connectionDetails.wsUrl}
      connect={true}
      onDisconnected={handleDisconnected}
      className="min-h-screen"
    >
      <BomiConversation onEnd={onEnd} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function BomiConversation({ onEnd }: { onEnd: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  const stateLabel: Record<string, string> = {
    disconnected: "연결 중...",
    connecting: "보미를 찾는 중...",
    initializing: "보미가 준비 중...",
    listening: "듣고 있어요! 말해보세요 🎤",
    thinking: "음... 생각 중!",
    speaking: "보미가 말하고 있어요!",
  };

  const isActive = state === "listening" || state === "speaking" || state === "thinking";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {/* 보미 캐릭터 + 오디오 시각화 */}
      <div className="relative flex flex-col items-center gap-4">
        {/* 말할 때 펄스 링 */}
        {state === "speaking" && (
          <div
            className="absolute w-40 h-40 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "var(--bomi-orange-light)",
              animation: "pulse-ring 1.5s ease-out infinite",
            }}
          />
        )}

        <div
          className="relative text-[100px] leading-none z-10"
          style={{
            animation: state === "speaking" ? "bounce-soft 0.8s ease-in-out infinite" : "none",
          }}
        >
          🦊
        </div>

        {/* 오디오 시각화 바 */}
        {audioTrack && (
          <div className="h-16 w-64">
            <BarVisualizer
              state={state}
              barCount={5}
              trackRef={audioTrack}
              options={{ minHeight: 10 }}
            />
          </div>
        )}
      </div>

      {/* 상태 텍스트 */}
      <p className="text-2xl font-medium text-center" style={{ color: "var(--bomi-text)" }}>
        {stateLabel[state] || "보미와 대화 중!"}
      </p>

      {/* 듣기 상태 표시 */}
      {state === "listening" && (
        <div className="flex gap-1 items-end h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 rounded-full"
              style={{
                background: "var(--bomi-green)",
                height: "100%",
                animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* 끝내기 버튼 */}
      {isActive && (
        <DisconnectButton
          className="px-8 py-3 rounded-full text-lg font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{ background: "#e57373" }}
        >
          대화 끝내기
        </DisconnectButton>
      )}
    </main>
  );
}
