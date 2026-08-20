import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralLink } from "./referral-link";
import { ProfileEditForm } from "./profile-edit-form";
import { DeleteAccount } from "./delete-account";
import { XP_LABELS } from "@/lib/xp-label";

export default async function PerfilPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      bio: true,
      referralCode: true,
      xpTotal: true,
      xpLabel: true,
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200 text-xl font-bold text-neutral-500">
              {(user.name ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-neutral-600">{user.email}</p>
            {user.bio && <p className="mt-1 max-w-md text-sm text-neutral-600">{user.bio}</p>}
          </div>
        </div>
        <ProfileEditForm
          name={user.name ?? ""}
          bio={user.bio ?? ""}
          image={user.image ?? ""}
          xpLabel={user.xpLabel}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm text-neutral-500">{XP_LABELS[user.xpLabel]}</p>
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

      <div className="border-t border-neutral-200 pt-6">
        <h2 className="font-bold text-red-700">Zona de perigo</h2>
        <div className="mt-3">
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}
