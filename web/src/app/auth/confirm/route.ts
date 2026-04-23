import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const { supabaseUrl, publishableKey } = getSupabaseConfig();
    const response = NextResponse.redirect(new URL(next, request.url));
    const supabase = createServerClient(supabaseUrl, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("next", next);
  redirectUrl.searchParams.set(
    "error",
    "이메일 확인 링크가 만료되었거나 올바르지 않습니다."
  );

  return NextResponse.redirect(redirectUrl);
}
