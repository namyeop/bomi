import Image from "next/image";
import Link from "next/link";

interface PaymentResultProps {
  success: boolean;
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
}

export function PaymentResult({
  success,
  title,
  description,
  linkHref,
  linkLabel,
}: PaymentResultProps) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 max-w-[480px] mx-auto"
      style={{ animation: "fade-in 500ms ease-out" }}
    >
      <div
        style={
          success
            ? { animation: "bounce-soft 2s ease-in-out infinite" }
            : undefined
        }
      >
        <Image
          src="/bomi-fox.png"
          alt={success ? "기뻐하는 보미" : "슬픈 보미"}
          width={140}
          height={140}
        />
      </div>

      <div className="text-center space-y-3">
        <h1
          className="text-2xl font-display font-bold"
          style={{
            color: success ? "var(--bomi-orange)" : "var(--bomi-red)",
          }}
        >
          {title}
        </h1>
        <p className="text-lg" style={{ color: "var(--bomi-text-muted)" }}>
          {description}
        </p>
      </div>

      <Link
        href={linkHref}
        className="px-10 py-4 rounded-full text-xl font-display font-bold text-white transition-transform hover:scale-105 active:scale-95"
        style={{ background: "var(--bomi-orange)" }}
      >
        {linkLabel}
      </Link>
    </main>
  );
}
