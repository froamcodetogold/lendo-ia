export type GoogleBookResult = {
  googleBooksId: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  pageCount: number | null;
  description: string | null;
};

async function fetchVolumes(url: URL) {
  // cache: "no-store" — o fetch estendido do Next.js guarda respostas de erro
  // junto com as de sucesso; sem isso, uma falha temporária ficava "presa"
  // em cache por horas pra aquela busca específica.
  return fetch(url, { cache: "no-store" });
}

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("langRestrict", "pt-BR");
  if (apiKey) url.searchParams.set("key", apiKey);

  let res = await fetchVolumes(url);
  // O backend do Google Books tem instabilidade ocasional (503) — vale uma
  // segunda tentativa antes de desistir, já que costuma passar na próxima.
  if (res.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    res = await fetchVolumes(url);
  }
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
