import { NextRequest, NextResponse } from "next/server";
import { runWeeklyLeagueReset } from "@/lib/gamification/league";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  await runWeeklyLeagueReset();

  return NextResponse.json({ ok: true });
}
