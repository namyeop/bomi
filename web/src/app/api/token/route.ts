import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "LiveKit 환경변수가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  const roomName = `bomi-${Date.now()}`;
  const participantName = `child-${Math.random().toString(36).slice(2, 7)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    name: participantName,
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token, wsUrl, roomName });
}
