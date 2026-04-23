import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  let userId: string;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    userId = user.id;
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "로그인 상태를 확인할 수 없습니다",
      },
      { status: 500 }
    );
  }

  const roomName = `bomi-${Date.now()}`;
  const participantName = `child-${userId.slice(0, 8)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    name: participantName,
    metadata: JSON.stringify({ supabaseUserId: userId }),
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
