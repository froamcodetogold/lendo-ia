import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckInSchema } from "@/lib/validations/goal";
import { generateQuiz, type QuizQuestion } from "@/lib/gemini/generate-quiz";
import { computeStreakUpdate } from "@/lib/gamification/streak";
import { REFERRAL_BONUS_XP } from "@/lib/gamification/xp";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }

  const parsed = createCheckInSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 422 });
  }
  const { readingGoalId, pageTo } = parsed.data;

  const goal = await prisma.readingGoal.findFirst({
    where: { id: readingGoalId, userId: session.user.id, status: "ACTIVE" },
    include: { book: true },
  });
  if (!goal) {
    return NextResponse.json({ error: "Meta de leitura não encontrada." }, { status: 404 });
  }
  if (pageTo <= goal.currentPage) {
    return NextResponse.json(
      { error: "A página informada precisa ser maior que a página atual." },
      { status: 422 }
    );
  }
  if (pageTo > goal.totalPages) {
    return NextResponse.json({ error: "A página informada passa do total do livro." }, { status: 422 });
  }

  const checkInDate = new Date();
  checkInDate.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.checkIn.findUnique({
    where: { readingGoalId_checkInDate: { readingGoalId, checkInDate } },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já fez check-in nessa meta hoje." }, { status: 409 });
  }

  const pageFrom = goal.currentPage + 1;

  let questions: QuizQuestion[];
  try {
    questions = await generateQuiz({
      bookTitle: goal.book.title,
      authors: goal.book.authors,
      pageFrom,
      pageTo,
      totalPages: goal.totalPages,
    });
  } catch (error) {
    console.error("generate_quiz_failed", error);
    return NextResponse.json(
      { error: "Não foi possível gerar o quiz agora. Tente novamente em instantes." },
      { status: 502 }
    );
  }

  const isFirstCheckInEver = (await prisma.checkIn.count({
    where: { readingGoal: { userId: session.user.id } },
  })) === 0;

  const [checkIn] = await prisma.$transaction([
    prisma.checkIn.create({
      data: {
        readingGoalId,
        pageFrom,
        pageTo,
        pagesRead: pageTo - pageFrom + 1,
        checkInDate,
        quizQuestions: questions,
      },
    }),
    prisma.readingGoal.update({
      where: { id: readingGoalId },
      data: {
        currentPage: pageTo,
        status: pageTo >= goal.totalPages ? "COMPLETED" : "ACTIVE",
      },
    }),
  ]);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const streakUpdate = computeStreakUpdate(user, checkInDate);
  await prisma.user.update({ where: { id: user.id }, data: streakUpdate });

  if (isFirstCheckInEver) {
    const referral = await prisma.referral.findUnique({
      where: { referredId: session.user.id },
    });
    if (referral && !referral.bonusXpAwarded) {
      await prisma.$transaction([
        prisma.referral.update({
          where: { id: referral.id },
          data: { bonusXpAwarded: true, bonusAwardedAt: new Date() },
        }),
        prisma.user.update({
          where: { id: referral.referrerId },
          data: {
            xpTotal: { increment: REFERRAL_BONUS_XP },
            xpWeekly: { increment: REFERRAL_BONUS_XP },
          },
        }),
      ]);
    }
  }

  // Não devolve correctIndex — a resposta é conferida no servidor em /quiz-answer.
  const sanitizedQuestions = questions.map(({ question, options }) => ({ question, options }));

  return NextResponse.json({ checkInId: checkIn.id, questions: sanitizedQuestions }, { status: 201 });
}
