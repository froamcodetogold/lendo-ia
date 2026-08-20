import { prisma } from "@/lib/prisma";

const PROMOTE_TOP_PERCENT = 0.2;
const RELEGATE_BOTTOM_PERCENT = 0.2;

/**
 * Roda 1x por semana (cron). Classifica cada usuário dentro da própria liga
 * por PERCENT_RANK() sobre xpWeekly — uma query só, sem loop por usuário —
 * e aplica promoção/rebaixamento num único UPDATE em lote. Depois zera o
 * XP semanal de todo mundo. Pensado pra ficar rápido mesmo com a base
 * crescendo, já que o trabalho pesado (ordenar, decidir liga) acontece só
 * nesse job, não a cada carregamento da tela de ranking.
 */
export async function runWeeklyLeagueReset() {
  await prisma.$executeRaw`
    WITH ranked AS (
      SELECT id, league,
        PERCENT_RANK() OVER (PARTITION BY league ORDER BY "xpWeekly" DESC) AS pct
      FROM "User"
    )
    UPDATE "User" u
    SET league = CASE
      WHEN r.pct <= ${PROMOTE_TOP_PERCENT} AND u.league = 'INICIANTE' THEN 'PRATA'::"League"
      WHEN r.pct <= ${PROMOTE_TOP_PERCENT} AND u.league = 'PRATA' THEN 'OURO'::"League"
      WHEN r.pct >= ${1 - RELEGATE_BOTTOM_PERCENT} AND u.league = 'OURO' THEN 'PRATA'::"League"
      WHEN r.pct >= ${1 - RELEGATE_BOTTOM_PERCENT} AND u.league = 'PRATA' THEN 'INICIANTE'::"League"
      ELSE u.league
    END
    FROM ranked r
    WHERE u.id = r.id;
  `;

  await prisma.user.updateMany({ data: { xpWeekly: 0 } });
}
