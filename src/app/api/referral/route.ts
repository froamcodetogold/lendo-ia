import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      _count: { select: { referralsGiven: true } },
    },
  });

  return NextResponse.json({
    referralCode: user.referralCode,
    referralsCount: user._count.referralsGiven,
  });
}
