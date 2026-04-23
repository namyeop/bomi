import Image from "next/image";
import { sendMagicLink } from "@/app/auth/actions";
import { MagicLinkSubmitButton } from "@/components/MagicLinkSubmitButton";
import { getSafeNextPath, getStringParam } from "@/lib/auth/redirects";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "로그인 - 보미",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = getSafeNextPath(getStringParam(params.next));
  const error = getStringParam(params.error);
  const message = getStringParam(params.message);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-10 max-w-[480px] mx-auto"
      role="main"
      aria-label="보미 로그인"
    >
      <Image src="/bomi-fox.png" alt="아기 여우 보미" width={128} height={128} priority />

      <div className="text-center space-y-2">
        <h1
          className="font-display font-bold"
          style={{ color: "var(--bomi-text)", fontSize: "2rem" }}
        >
          로그인
        </h1>
        <p className="text-lg" style={{ color: "var(--bomi-text-muted)" }}>
          이메일로 받은 링크를 눌러 보미를 시작해요.
        </p>
      </div>

      {message && (
        <p
          className="w-full rounded-[var(--bomi-radius-sm)] px-4 py-3 text-base"
          style={{ background: "var(--bomi-surface)", color: "var(--bomi-text)" }}
          role="status"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className="w-full rounded-[var(--bomi-radius-sm)] px-4 py-3 text-base"
          style={{ background: "#fff1f1", color: "var(--bomi-red)" }}
          role="alert"
        >
          {error}
        </p>
      )}

      <form action={sendMagicLink} className="w-full space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block">
          <span className="block mb-2 font-medium" style={{ color: "var(--bomi-text)" }}>
            이메일
          </span>
          <input
            className="w-full min-h-14 rounded-[var(--bomi-radius-sm)] px-4 text-lg outline-none"
            style={{
              background: "white",
              border: "2px solid var(--bomi-surface)",
              color: "var(--bomi-text)",
            }}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <MagicLinkSubmitButton />
      </form>
    </main>
  );
}
