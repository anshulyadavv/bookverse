import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import EPub from "epub2";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");

  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });

    let filtered = books;

    if (genre) {
      filtered = filtered.filter((b) => {
        const genres: string[] = JSON.parse(b.genres || "[]");
        return genres.some((g) => g.toLowerCase().includes(genre.toLowerCase()));
      });
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }

    const result = filtered.map((b) => ({
      ...b,
      genres: JSON.parse(b.genres || "[]"),
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string | null;
    const genres = formData.get("genres") as string | null;
    const series = formData.get("series") as string | null;
    const epubFile = formData.get("epub") as File | null;
    const coverFile = formData.get("cover") as File | null;

    let epubUrl: string | null = null;
    let coverUrl: string | null = null;

    if (epubFile && epubFile.size > 0) {
      const filename = `${Date.now()}_${epubFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const blob = await put(filename, epubFile, { access: 'public' });
      epubUrl = blob.url;

      // Automatically extract cover if not provided by user
      if (!coverFile || coverFile.size === 0) {
        try {
          const tempPath = path.join(tmpdir(), filename);
          const bytes = await epubFile.arrayBuffer();
          await writeFile(tempPath, Buffer.from(bytes));

          await new Promise<void>((resolve) => {
            const epub = new EPub(tempPath);
            epub.on("end", () => {
              const coverId = epub.metadata.cover;
              if (coverId) {
                epub.getImage(coverId, async (err: any, data: Buffer, mimeType: string) => {
                  if (!err && data) {
                    try {
                      const coverBlob = await put(`cover_${Date.now()}`, data, { access: 'public', contentType: mimeType });
                      coverUrl = coverBlob.url;
                    } catch (e) {}
                  }
                  resolve();
                });
              } else {
                resolve();
              }
            });
            epub.on("error", () => resolve());
            epub.parse();
          });

          await unlink(tempPath).catch(() => {});
        } catch (e) {
          console.error("Cover extraction failed:", e);
        }
      }
    }

    if (coverFile && coverFile.size > 0) {
      const filename = `cover_${Date.now()}_${coverFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const blob = await put(filename, coverFile, { access: 'public' });
      coverUrl = blob.url;
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        description,
        genres: genres || "[]",
        series,
        epubUrl,
        cover: coverUrl,
      },
    });

    return NextResponse.json({
      ...book,
      genres: JSON.parse(book.genres || "[]"),
      createdAt: book.createdAt.toISOString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}
