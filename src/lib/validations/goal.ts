import { z } from "zod";

export const createGoalSchema = z.object({
  googleBooksId: z.string().min(1),
  title: z.string().min(1).max(300),
  authors: z.array(z.string()).max(10),
  thumbnailUrl: z.string().url().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  totalPages: z.number().int().min(1).max(20000),
  days: z.number().int().min(1).max(365),
});

export const createCheckInSchema = z.object({
  readingGoalId: z.string().min(1),
  pageTo: z.number().int().min(1),
});

export const quizAnswerSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)).length(3),
});
