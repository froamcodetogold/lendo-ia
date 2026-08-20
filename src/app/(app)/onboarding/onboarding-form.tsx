"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GoogleBookResult } from "@/lib/google-books/client";

export function OnboardingForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBookResult[]>([]);
  const [selected, setSelected] = useState<GoogleBookResult | null>(null);
  const [days, setDays] = useState(14);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setError("");
    try {
      const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
    } catch {
      setError("Não foi possível buscar livros agora.");
    } finally {
      setSearching(false);
    }
  }

  async function createGoal() {
    if (!selected?.pageCount) {
      setError("Esse livro não tem número de páginas cadastrado no Google Books.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleBooksId: selected.googleBooksId,
          title: selected.title,
          authors: selected.authors,
          thumbnailUrl: selected.thumbnailUrl,
          description: selected.description,
          totalPages: selected.pageCount,
          days,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível criar a meta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (selected) {
    const dailyGoal = selected.pageCount ? Math.ceil(selected.pageCount / days) : null;
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex gap-4">
          {selected.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selected.thumbnailUrl} alt="" className="h-32 w-auto rounded shadow" />
          )}
          <div>
            <h2 className="font-bold">{selected.title}</h2>
            <p className="text-sm text-neutral-600">{selected.authors.join(", ")}</p>
            <p className="mt-1 text-sm text-neutral-500">{selected.pageCount ?? "?"} páginas</p>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium">Em quantos dias você quer terminar?</span>
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </label>

        {dailyGoal && (
          <p className="mt-2 text-sm text-neutral-600">
            Isso dá aproximadamente <strong>{dailyGoal} páginas por dia</strong>.
          </p>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={createGoal}
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Criando..." : "Começar a ler"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="rounded-lg border border-neutral-300 px-4 py-2 font-medium"
          >
            Escolher outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome do livro..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {searching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {results.map((book) => (
          <button
            key={book.googleBooksId}
            type="button"
            onClick={() => setSelected(book)}
            className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 text-left hover:border-neutral-400"
          >
            {book.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.thumbnailUrl} alt="" className="h-20 w-auto rounded shadow" />
            )}
            <div>
              <p className="font-medium">{book.title}</p>
              <p className="text-sm text-neutral-600">{book.authors.join(", ")}</p>
              {book.pageCount && <p className="text-xs text-neutral-500">{book.pageCount} páginas</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
