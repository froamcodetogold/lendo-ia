import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/lib/google-books/client";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Informe ao menos 2 caracteres." }, { status: 400 });
  }

  try {
    const results = await searchBooks(q);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("books_search_failed", error);
    return NextResponse.json({ error: "Não foi possível buscar livros." }, { status: 502 });
  }
}
