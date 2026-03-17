import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart-Fit — Идеальный рацион без единой мысли о калориях",
  description: "Сфотографируйте еду — AI посчитает калории. Получите персональное меню на каждый день. Худейте без стресса.",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
