import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StreakBadge } from "@/components/gamification/streak-badge";
import { XpBar } from "@/components/gamification/xp-bar";
import { LeagueBadge } from "@/components/gamification/league-badge";
import { ClaimReferral } from "@/components/claim-referral";

export default async function DashboardPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  const activeGoal = await prisma.readingGoal.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <Suspense>
        <ClaimReferral />
      </Suspense>

      <div className="flex flex-wrap items-center gap-3">
        <StreakBadge days={user.currentStreak} />
        <LeagueBadge league={user.league} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <XpBar xp={user.xpTotal} label="XP total" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <XpBar xp={user.xpWeekly} label="XP nesta semana" />
        </div>
      </div>

      {activeGoal ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-500">Lendo agora</p>
          <h2 className="mt-1 text-xl font-bold">{activeGoal.book.title}</h2>
          <p className="mt-1 text-neutral-600">
            Página {activeGoal.currentPage} de {activeGoal.totalPages} — meta de{" "}
            {activeGoal.dailyPageGoal} páginas/dia
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${Math.min(100, (activeGoal.currentPage / activeGoal.totalPages) * 100)}%` }}
            />
          </div>
          <Link
            href={`/checkin?goalId=${activeGoal.id}`}
            className="mt-5 inline-block rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-800"
          >
            Fazer check-in de hoje
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <p className="text-neutral-600">Você ainda não tem uma meta de leitura ativa.</p>
          <Link
            href="/onboarding"
            className="mt-4 inline-block rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-800"
          >
            Escolher um livro
          </Link>
        </div>
      )}
    </div>
  );
}
