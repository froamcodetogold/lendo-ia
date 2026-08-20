import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizAnswerSchema } from "@/lib/validations/goal";
import { calculateCheckInXp } from "@/lib/gamification/xp";
import type { QuizQuestion } from "@/lib/gemini/generate-quiz";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = quizAnswerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Respostas inválidas." }, { status: 422 });
  }

  const checkIn = await prisma.checkIn.findFirst({
    where: { id, readingGoal: { userId: session.user.id } },
  });
  if (!checkIn) {
    return NextResponse.json({ error: "Check-in não encontrado." }, { status: 404 });
  }
  if (checkIn.quizAnswers !== null) {
    return NextResponse.json({ error: "Esse quiz já foi respondido." }, { status: 409 });
  }

  const questions = checkIn.quizQuestions as unknown as QuizQuestion[];
  const { answers } = parsed.data;

  const quizScore = answers.reduce(
    (score, answer, i) => (answer === questions[i]?.correctIndex ? score + 1 : score),
    0
  );
  const xpEarned = calculateCheckInXp(quizScore);

  await prisma.$transaction([
    prisma.checkIn.update({
      where: { id },
      data: { quizAnswers: answers, quizScore, xpEarned },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        xpTotal: { increment: xpEarned },
        xpWeekly: { increment: xpEarned },
      },
    }),
  ]);

  const correctAnswers = questions.map((q) => q.correctIndex);

  return NextResponse.json({ quizScore, xpEarned, correctAnswers });
}
