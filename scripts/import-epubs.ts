import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/db';
// @ts-ignore
import { EPub } from 'epub2';

const STORE_DIR = path.join(__dirname, '..', 'store', 'Book Store');
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');

async function extractMetadata(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);
    epub.on('end', () => {
      resolve(epub);
    });
    epub.on('error', (err: any) => {
      reject(err);
    });
    epub.parse();
  });
}

async function getCover(epub: any): Promise<{ data: Buffer; mimeType: string } | null> {
  return new Promise((resolve) => {
    const coverId = epub.metadata.cover;
    if (!coverId) {
      resolve(null);
      return;
    }

    epub.getImage(coverId, (err: any, data: Buffer, mimeType: string) => {
      if (err || !data) {
        resolve(null);
      } else {
        resolve({ data, mimeType });
      }
    });
  });
}

async function importEpubs() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

  const files = fs.readdirSync(STORE_DIR);
  let importedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.epub')) continue;

    const sourcePath = path.join(STORE_DIR, file);
    const destPath = path.join(UPLOADS_DIR, file);

    console.log(`\n📖 Processing: ${file}...`);

    try {
      // 1. Copy file to public/uploads
      fs.copyFileSync(sourcePath, destPath);

      // 2. Extract metadata
      let title = file.replace('.epub', '').replace(/_/g, ' ');
      let author = 'Unknown Author';
      let description = '';
      let coverUrl = null;

      try {
        const epub = await extractMetadata(sourcePath);
        title = epub.metadata.title || title;
        author = epub.metadata.creator || author;
        description = epub.metadata.description || '';

        // 3. Extract cover
        const cover = await getCover(epub);
        if (cover) {
          const coverFilename = `${path.parse(file).name}_cover.${cover.mimeType.split('/')[1] || 'jpg'}`;
          const coverPath = path.join(COVERS_DIR, coverFilename);
          fs.writeFileSync(coverPath, cover.data);
          coverUrl = `/uploads/covers/${coverFilename}`;
          console.log(`   🖼️  Cover extracted: ${coverFilename}`);
        } else {
          console.log(`   ⚠️  No cover found in metadata.`);
        }
      } catch (metadataErr) {
        console.error(`   ⚠️  Failed to extract metadata: ${metadataErr}`);
      }

      // 4. Update or Create in DB
      await prisma.book.upsert({
        where: { title_author: { title, author } },
        update: {
          epubUrl: `/uploads/${file}`,
          cover: coverUrl,
          description,
        },
        create: {
          title,
          author,
          epubUrl: `/uploads/${file}`,
          cover: coverUrl,
          description,
          genres: JSON.stringify(["Imported"]),
        }
      });

      console.log(`   ✅ Success: ${title}`);
      importedCount++;
    } catch (e) {
      console.error(`   ❌ Failed to import ${file}:`, e);
    }
  }

  console.log(`\n🎉 Successfully processed ${importedCount} EPUBs!`);
}

importEpubs().catch(console.error);
