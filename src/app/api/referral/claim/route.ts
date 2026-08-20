import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const claimSchema = z.object({ code: z.string().min(1).max(60) });

/**
 * Chamado pelo client logo após o primeiro login, se houver um código de
 * indicação salvo (ex: veio de /entrar?ref=CODE). O bônus de XP só é
 * concedido depois, no primeiro check-in de leitura (ver /api/checkins) —
 * aqui só registra o vínculo entre quem indicou e quem foi indicado.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }

  const parsed = claimSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Código inválido." }, { status: 422 });
  }

  const referrer = await prisma.user.findUnique({
    where: { referralCode: parsed.data.code },
    select: { id: true },
  });
  if (!referrer) {
    return NextResponse.json({ error: "Código de indicação não encontrado." }, { status: 404 });
  }
  if (referrer.id === session.user.id) {
    return NextResponse.json({ error: "Você não pode indicar a si mesmo." }, { status: 422 });
  }

  const already = await prisma.referral.findUnique({
    where: { referredId: session.user.id },
  });
  if (already) {
    return NextResponse.json({ error: "Você já entrou por uma indicação." }, { status: 409 });
  }

  await prisma.referral.create({
    data: { referrerId: referrer.id, referredId: session.user.id },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
