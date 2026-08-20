import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeagueBadge } from "@/components/gamification/league-badge";

export default async function RankingPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  const users = await prisma.user.findMany({
    where: { league: user.league },
    orderBy: { xpWeekly: "desc" },
    take: 50,
    select: { id: true, name: true, image: true, xpWeekly: true, currentStreak: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ranking semanal</h1>
        <LeagueBadge league={user.league} />
      </div>
      <p className="mt-1 text-neutral-600">
        Zera toda segunda-feira. Os melhores da liga sobem, os últimos descem.
      </p>

      <ol className="mt-6 space-y-2">
        {users.map((u, i) => (
          <li
            key={u.id}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              u.id === user.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 bg-white"
            }`}
          >
            <span className="w-6 text-center font-bold text-neutral-400">{i + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {u.image && <img src={u.image} alt="" className="size-8 rounded-full" />}
            <span className="flex-1 font-medium">{u.name ?? "Leitor"}</span>
            <span className="text-sm text-neutral-500">🔥 {u.currentStreak}</span>
            <span className="font-bold">{u.xpWeekly} XP</span>
          </li>
        ))}
        {users.length === 0 && (
          <p className="text-neutral-500">Ninguém na sua liga ainda essa semana.</p>
        )}
      </ol>
    </div>
  );
}
