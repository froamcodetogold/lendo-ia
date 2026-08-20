import { SchemaType, type Schema } from "@google/generative-ai";
import { getGeminiModel } from "./client";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

const quizSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          correctIndex: { type: SchemaType.INTEGER },
        },
        required: ["question", "options", "correctIndex"],
      },
    },
  },
  required: ["questions"],
};

/**
 * Não temos o texto do livro (não hospedamos PDF nenhum) — o quiz é gerado a
 * partir do conhecimento geral do Gemini sobre a obra, focado em temas,
 * personagens e eventos tipicamente cobertos até o trecho informado. Pra
 * livros que o modelo não conhece bem, o prompt pede perguntas mais
 * genéricas de reflexão sobre leitura em vez de inventar detalhes.
 */
export async function generateQuiz(params: {
  bookTitle: string;
  authors: string[];
  pageFrom: number;
  pageTo: number;
  totalPages: number;
}): Promise<QuizQuestion[]> {
  const { bookTitle, authors, pageFrom, pageTo, totalPages } = params;

  const prompt = `Você é um assistente de incentivo à leitura. Um leitor acabou de ler as páginas ${pageFrom} a ${pageTo} (de um total de ${totalPages}) do livro "${bookTitle}"${
    authors.length ? `, de ${authors.join(", ")}` : ""
  }.

Gere exatamente 3 perguntas de múltipla escolha (4 alternativas cada, só 1 correta) que um leitor que realmente leu até esse ponto do livro conseguiria responder. Baseie-se em temas, personagens e eventos que você sabe fazerem parte dessa obra até essa faixa de páginas.

Se você não tiver certeza do conteúdo específico dessa obra nessa faixa de páginas, gere perguntas mais gerais sobre reflexão de leitura (ex: "qual foi a parte mais marcante que você leu até agora?", com alternativas plausíveis) em vez de inventar fatos específicos incorretos.

Responda só com o JSON pedido, em português.`;

  const model = getGeminiModel();
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: quizSchema,
    },
  });

  const parsed = JSON.parse(result.response.text()) as {
    questions: QuizQuestion[];
  };

  const questions = parsed.questions.slice(0, 3).filter(
    (q) =>
      typeof q.question === "string" &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 &&
      q.correctIndex <= 3
  );

  if (questions.length === 0) {
    throw new Error("Gemini não retornou perguntas válidas");
  }

  return questions;
}
