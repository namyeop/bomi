"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useRoomContext,
  BarVisualizer,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";
import Image from "next/image";
import { RoomEvent } from "livekit-client";
import { useCallback, useEffect, useRef, useState } from "react";

const PARENT_REPORT_ATTRIBUTE = "bomi_parent_report";

interface BomiRoomProps {
  onEnd: (parentReport?: string) => void;
}

export function BomiRoom({ onEnd }: BomiRoomProps) {
  const [connectionDetails, setConnectionDetails] = useState<{
    token: string;
    wsUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const parentReportRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // 마이크 권한 확인 후 토큰 요청
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // 권한 확인 후 스트림 정리
        stream.getTracks().forEach((t) => t.stop());
        return fetch("/api/token");
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setConnectionDetails({ token: data.token, wsUrl: data.wsUrl });
      })
      .catch((err) => {
        if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
          setMicDenied(true);
        } else {
          setError("서버에 연결할 수 없어요");
        }
      });
  }, []);

  const handleDisconnected = useCallback(() => {
    onEnd(parentReportRef.current);
  }, [onEnd]);

  const handleParentReport = useCallback((parentReport?: string) => {
    parentReportRef.current = parentReport;
  }, []);

  // 마이크 거부 상태
  if (micDenied) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 max-w-[480px] mx-auto"
        style={{ animation: "fade-in 300ms ease-out" }}
        role="alert"
        aria-label="마이크 권한 필요"
      >
        <Image src="/bomi-fox.png" alt="보미가 기다리고 있어요" width={120} height={120} />
        <p className="text-xl text-center font-display font-bold" style={{ color: "var(--bomi-text)" }}>
          보미가 네 목소리를 들을 수 없어요
        </p>
        <p className="text-base text-center" style={{ color: "var(--bomi-text-muted)" }}>
          마이크를 허용해야 보미와 대화할 수 있어요.
        </p>
        <button
          onClick={() => {
            setMicDenied(false);
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                stream.getTracks().forEach((t) => t.stop());
                return fetch("/api/token");
              })
              .then((res) => res.json())
              .then((data) => {
                if (data.error) {
                  setError(data.error);
                  return;
                }
                setConnectionDetails({ token: data.token, wsUrl: data.wsUrl });
              })
              .catch((err) => {
                if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
                  setMicDenied(true);
                } else {
                  setError("서버에 연결할 수 없어요");
                }
              });
          }}
          className="px-10 py-4 rounded-full text-xl font-display font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{ background: "var(--bomi-orange)" }}
          aria-label="마이크 다시 허용하기"
        >
          마이크 허용하기
        </button>
        <button
          onClick={() => onEnd()}
          className="px-10 py-4 rounded-full text-lg font-display font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "var(--bomi-surface)",
            color: "var(--bomi-text-muted)",
            border: "2px solid var(--bomi-text-muted)",
          }}
          aria-label="돌아가기"
        >
          돌아가기
        </button>
      </main>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 max-w-[480px] mx-auto"
        style={{ animation: "fade-in 300ms ease-out" }}
        role="alert"
        aria-label="연결 오류"
      >
        <Image src="/bomi-fox.png" alt="보미가 슬퍼하고 있어요" width={120} height={120} />
        <p className="text-xl text-center" style={{ color: "var(--bomi-text-muted)" }}>
          {error}
        </p>
        <button
          onClick={() => onEnd()}
          className="px-10 py-4 rounded-full text-xl font-display font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{ background: "var(--bomi-orange)" }}
          aria-label="돌아가기"
        >
          돌아가기
        </button>
      </main>
    );
  }

  // 로딩 상태
  if (!connectionDetails) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        role="status"
        aria-label="보미에 연결 중"
      >
        <div style={{ animation: "bounce-soft 1s ease-in-out infinite" }}>
          <Image src="/bomi-fox.png" alt="보미를 찾는 중" width={120} height={120} />
        </div>
        <p className="text-xl font-display font-medium" style={{ color: "var(--bomi-text-muted)" }}>
          보미를 만나는 중...
        </p>
      </main>
    );
  }

  return (
    <LiveKitRoom
      token={connectionDetails.token}
      serverUrl={connectionDetails.wsUrl}
      connect={true}
      audio={true}
      onDisconnected={handleDisconnected}
      className="min-h-screen"
    >
      <BomiConversation onParentReport={handleParentReport} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function BomiConversation({ onParentReport }: { onParentReport: (report?: string) => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const room = useRoomContext();
  const [sttFailed, setSttFailed] = useState(false);

  useEffect(() => {
    const handleParticipantAttributesChanged = (changed: Record<string, string>) => {
      if (changed[PARENT_REPORT_ATTRIBUTE] !== undefined) {
        onParentReport(changed[PARENT_REPORT_ATTRIBUTE]);
      }
    };

    room.on(RoomEvent.ParticipantAttributesChanged, handleParticipantAttributesChanged);
    return () => {
      room.off(RoomEvent.ParticipantAttributesChanged, handleParticipantAttributesChanged);
    };
  }, [room, onParentReport]);

  // STT 실패 감지: listening 상태가 10초 이상 지속되면 안내
  useEffect(() => {
    if (state !== "listening") {
      setSttFailed(false);
      return;
    }
    const timer = setTimeout(() => setSttFailed(true), 10000);
    return () => clearTimeout(timer);
  }, [state]);

  const stateLabel: Record<string, string> = {
    disconnected: "연결 중...",
    connecting: "보미를 찾는 중...",
    initializing: "보미가 준비 중...",
    listening: "듣고 있어요! 말해보세요",
    thinking: "음... 생각 중!",
    speaking: "보미가 말하고 있어요!",
  };

  const isActive = state === "listening" || state === "speaking" || state === "thinking";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 max-w-[480px] mx-auto"
      role="main"
      aria-label="보미와 대화 중"
      aria-live="polite"
    >
      {/* 보미 캐릭터 + 오디오 시각화 */}
      <div className="relative flex flex-col items-center gap-4">
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
          className="relative z-10"
          style={{
            animation: state === "speaking" ? "bounce-soft 0.8s ease-in-out infinite" : "none",
          }}
        >
          <Image src="/bomi-fox.png" alt={`보미 - ${stateLabel[state] || "대화 중"}`} width={160} height={160} priority />
        </div>

        {audioTrack && (
          <div className="h-16 w-64" aria-hidden="true">
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
      <p
        className="text-2xl font-display font-medium text-center"
        style={{ color: "var(--bomi-text)" }}
        role="status"
      >
        {sttFailed ? "잘 못 알아들었어요. 다시 말해줄래?" : stateLabel[state] || "보미와 대화 중!"}
      </p>

      {/* 듣기 상태 표시 */}
      {state === "listening" && !sttFailed && (
        <div className="flex gap-1 items-end h-8" aria-hidden="true">
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

      {/* STT 실패 시 다시 시도 유도 */}
      {sttFailed && (
        <button
          onClick={() => setSttFailed(false)}
          className="px-8 py-4 rounded-full text-lg font-display font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "var(--bomi-surface)",
            color: "var(--bomi-orange)",
            border: "2px solid var(--bomi-orange)",
          }}
          aria-label="다시 말하기"
        >
          다시 말해볼래요
        </button>
      )}

      {/* 끝내기 버튼 */}
      {isActive && (
        <DisconnectButton
          className="px-10 py-4 rounded-full text-lg font-display font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "var(--bomi-surface)",
            color: "var(--bomi-text-muted)",
            border: "2px solid var(--bomi-text-muted)",
          }}
          aria-label="대화 끝내기"
        >
          대화 끝내기
        </DisconnectButton>
      )}
    </main>
  );
}
