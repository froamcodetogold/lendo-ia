export type GoogleBookResult = {
  googleBooksId: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  pageCount: number | null;
  description: string | null;
};

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("langRestrict", "pt-BR");
  if (apiKey) url.searchParams.set("key", apiKey);

  // cache: "no-store" — o fetch estendido do Next.js armazena respostas de erro
  // junto com as de sucesso; sem isso, uma falha temporária (chave inválida,
  // rate limit) ficava "presa" em cache por horas pra aquela busca específica.
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Books API respondeu ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    items?: Array<{
      id: string;
      volumeInfo?: {
        title?: string;
        authors?: string[];
        pageCount?: number;
        description?: string;
        imageLinks?: { thumbnail?: string };
      };
    }>;
  };

  return (data.items ?? [])
    .filter((item) => item.volumeInfo?.title)
    .map((item) => ({
      googleBooksId: item.id,
      title: item.volumeInfo!.title!,
      authors: item.volumeInfo?.authors ?? [],
      thumbnailUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
      pageCount: item.volumeInfo?.pageCount ?? null,
      description: item.volumeInfo?.description ?? null,
    }));
}
