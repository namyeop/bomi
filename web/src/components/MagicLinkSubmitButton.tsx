"use client";

import { useFormStatus } from "react-dom";

export function MagicLinkSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-full rounded-full px-8 py-4 text-xl font-display font-bold text-white cursor-pointer transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
      style={{ background: "var(--bomi-orange)" }}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? "링크 보내는 중..." : "로그인 링크 받기"}
    </button>
  );
}
