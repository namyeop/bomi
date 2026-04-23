"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSafeNextPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(pathname: "/login", params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  redirect(`${pathname}?${searchParams.toString()}`);
}

function getRequiredText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getMagicLinkErrorMessage(error: { message?: string; status?: number }) {
  if (error.status === 429) {
    return "로그인 링크 요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.message?.toLowerCase().includes("signup")) {
    return "Supabase에서 새 사용자 생성을 허용하지 않고 있습니다. Auth 설정을 확인해 주세요.";
  }

  return "로그인 링크를 보낼 수 없습니다. Supabase Auth 설정을 확인해 주세요.";
}

export async function sendMagicLink(formData: FormData) {
  const email = getRequiredText(formData, "email").toLowerCase();
  const next = getSafeNextPath(formData.get("next"));

  if (!email) {
    redirectWithMessage("/login", {
      next,
      error: "이메일을 입력해 주세요.",
    });
  }

  const requestHeaders = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    requestHeaders.get("origin") ||
    "http://localhost:3000";
  const emailRedirectTo = new URL("/auth/confirm", origin);
  emailRedirectTo.searchParams.set("next", next);

  let linkError: string | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: emailRedirectTo.toString(),
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("Supabase magic link error", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      linkError = getMagicLinkErrorMessage(error);
    }
  } catch (err) {
    console.error("Supabase magic link unexpected error", err);
    linkError =
      err instanceof Error
        ? err.message
        : "로그인 링크를 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (linkError) {
    redirectWithMessage("/login", {
      next,
      error: linkError,
    });
  }

  redirectWithMessage("/login", {
    next,
    message: "로그인 링크를 보냈습니다. 메일에서 링크를 눌러 계속해 주세요.",
  });
}
