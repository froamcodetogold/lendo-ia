import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralLink } from "./referral-link";

export default async function PerfilPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: {
      name: true,
      email: true,
      referralCode: true,
      xpTotal: true,
      longestStreak: true,
      _count: { select: { referralsGiven: true } },
    },
  });

  const goals = await prisma.readingGoal.findMany({
    where: { userId: session!.user.id },
    include: { book: true, checkIns: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-neutral-600">{user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">XP total</p>
          <p className="text-xl font-bold">{user.xpTotal}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Maior streak</p>
          <p className="text-xl font-bold">🔥 {user.longestStreak} dias</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">Amigos indicados</p>
          <p className="text-xl font-bold">{user._count.referralsGiven}</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-bold">Indique e ganhe</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Ganhe XP bônus quando seu amigo fizer o primeiro check-in de leitura.
        </p>
        <div className="mt-3">
          <ReferralLink code={user.referralCode} />
        </div>
      </div>

      <div>
        <h2 className="font-bold">Histórico de leitura</h2>
        <div className="mt-3 space-y-3">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{goal.book.title}</p>
                <span className="text-sm text-neutral-500">
                  {goal.status === "COMPLETED"
                    ? "Concluído"
                    : goal.status === "ABANDONED"
                      ? "Abandonado"
                      : "Em andamento"}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                {goal.currentPage}/{goal.totalPages} páginas · {goal.checkIns.length} check-ins
              </p>
            </div>
          ))}
          {goals.length === 0 && <p className="text-neutral-500">Nenhuma leitura ainda.</p>}
        </div>
      </div>
    </div>
  );
}
