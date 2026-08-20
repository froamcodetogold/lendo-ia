import type { XpLabel } from "@prisma/client";

export const XP_LABELS: Record<XpLabel, string> = {
  XP_TOTAL: "XP total",
  AURA_FARMADA: "Aura Farmada",
  PONTOS_DE_LEITURA: "Pontos de Leitura",
  MANA_LITERARIA: "Mana Literária",
};

export const XP_LABEL_OPTIONS = Object.entries(XP_LABELS) as [XpLabel, string][];
