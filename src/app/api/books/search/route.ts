import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchBooks } from "@/lib/google-books/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Informe ao menos 2 caracteres." }, { status: 400 });
  }

  try {
    const results = await searchBooks(q);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("books_search_failed", error);
    const debug = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Não foi possível buscar livros.", debug }, { status: 502 });
  }
}
