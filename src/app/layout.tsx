import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart-Fit — AI-трекер питания",
  description: "Персональный план питания с AI-нутрициологом",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
