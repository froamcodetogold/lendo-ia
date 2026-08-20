"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Question = { question: string; options: string[] };

export function CheckInFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goalId");

  const [step, setStep] = useState<"form" | "quiz" | "result">("form");
  const [pageTo, setPageTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);

  const [result, setResult] = useState<{ quizScore: number; xpEarned: number } | null>(null);

  if (!goalId) {
    return <p className="text-neutral-600">Nenhuma meta selecionada. Volte pro painel.</p>;
  }

  async function submitPages(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingGoalId: goalId, pageTo: Number(pageTo) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCheckInId(data.checkInId);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(-1));
      setStep("quiz");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar o check-in.");
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    if (!checkInId || answers.some((a) => a === -1)) {
      setError("Responda todas as perguntas antes de enviar.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/checkins/${checkInId}/quiz-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ quizScore: data.quizScore, xpEarned: data.xpEarned });
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o quiz.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "result" && result) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
        <p className="text-4xl">🎉</p>
        <h2 className="mt-2 text-xl font-bold">Check-in registrado!</h2>
        <p className="mt-1 text-neutral-600">
          Você acertou {result.quizScore} de {questions.length} perguntas e ganhou{" "}
          <strong>{result.xpEarned} XP</strong>.
        </p>
        <button
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Voltar pro painel
        </button>
      </div>
    );
  }

  if (step === "quiz") {
    return (
      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-xl border border-neutral-200 bg-white p-5">
            <p className="font-medium">{q.question}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
                    answers[qi] === oi ? "border-indigo-600 bg-indigo-50" : "border-neutral-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${qi}`}
                    checked={answers[qi] === oi}
                    onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={submitQuiz}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar respostas"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submitPages} className="rounded-xl border border-neutral-200 bg-white p-6">
      <label className="block">
        <span className="text-sm font-medium">Até qual página você leu hoje?</span>
        <input
          type="number"
          required
          min={1}
          value={pageTo}
          onChange={(e) => setPageTo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Gerando quiz..." : "Confirmar leitura"}
        </button>
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
