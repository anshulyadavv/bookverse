import { OpenLibraryBook } from "@/types";

const BASE = "https://openlibrary.org";

export async function searchBooks(query: string, limit = 10): Promise<OpenLibraryBook[]> {
  try {
    const res = await fetch(
      `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,subject,first_publish_year`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs ?? [];
  } catch {
    return [];
  }
}

export async function getBooksBySubject(subject: string, limit = 8): Promise<OpenLibraryBook[]> {
  try {
    const res = await fetch(
      `${BASE}/subjects/${encodeURIComponent(subject.toLowerCase())}.json?limit=${limit}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.works ?? []).map((w: Record<string, unknown>) => ({
      key: w.key,
      title: w.title,
      author_name: (w.authors as Array<{name: string}>)?.map((a) => a.name),
      cover_i: (w.cover_id as number) ?? undefined,
    }));
  } catch {
    return [];
  }
}

export function getCoverUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
