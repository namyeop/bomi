import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "보미 (Bomi) — 영어 대화 친구",
  description: "호기심 많은 아기 여우 보미와 영어로 대화해요!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
