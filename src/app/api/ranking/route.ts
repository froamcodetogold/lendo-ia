import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { League } from "@prisma/client";

const VALID_LEAGUES: League[] = ["INICIANTE", "PRATA", "OURO"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { league: true },
  });

  const leagueParam = req.nextUrl.searchParams.get("league");
  const league =
    leagueParam && VALID_LEAGUES.includes(leagueParam as League)
      ? (leagueParam as League)
      : currentUser.league;

  const users = await prisma.user.findMany({
    where: { league },
    orderBy: { xpWeekly: "desc" },
    take: 50,
    select: { id: true, name: true, image: true, xpWeekly: true, currentStreak: true },
  });

  return NextResponse.json({ league, users });
}
