import type { League } from "@prisma/client";

const LEAGUE_STYLES: Record<League, { label: string; className: string }> = {
  INICIANTE: { label: "Iniciante", className: "bg-neutral-200 text-neutral-700" },
  PRATA: { label: "Prata", className: "bg-slate-200 text-slate-700" },
  OURO: { label: "Ouro", className: "bg-amber-200 text-amber-800" },
};

export function LeagueBadge({ league }: { league: League }) {
  const style = LEAGUE_STYLES[league];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${style.className}`}>
      Liga {style.label}
    </span>
  );
}
