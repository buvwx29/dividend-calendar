import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "배당 캘린더",
  description: "국내외 배당 일정을 한눈에 확인하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
