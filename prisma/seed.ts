/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { PrismaClient } = require("@prisma/client");

const DB_URL = `file:${path.join(__dirname, "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: DB_URL });
const prisma = new PrismaClient({ adapter });

const BOOKS = [
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    cover: "https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg",
    genres: JSON.stringify(["fantasy", "adventure"]),
    totalPages: 662,
    description: "The riveting first-person narrative of Kvothe, a legendary figure in his own time.",
    series: "The Kingkiller Chronicle",
    volume: 1,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    cover: "https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg",
    genres: JSON.stringify(["science fiction", "adventure"]),
    totalPages: 896,
    description: "Set in the distant future, Dune tells the story of young Paul Atreides.",
    series: "Dune Chronicles",
    volume: 1,
  },
  {
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    cover: "https://covers.openlibrary.org/b/isbn/9781400052929-L.jpg",
    genres: JSON.stringify(["science fiction", "comedy"]),
    totalPages: 193,
    description: "Seconds before Earth is demolished, Arthur Dent is whisked into space.",
    series: "Hitchhiker's Guide",
    volume: 1,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    genres: JSON.stringify(["classic", "literary fiction"]),
    totalPages: 180,
    description: "The story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.",
  },
  {
    title: "1984",
    author: "George Orwell",
    cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    genres: JSON.stringify(["dystopian", "classic", "science fiction"]),
    totalPages: 328,
    description: "A terrifying vision of a totalitarian future.",
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    cover: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
    genres: JSON.stringify(["philosophy", "adventure", "fantasy"]),
    totalPages: 208,
    description: "A fable about following your dream.",
  },
  {
    title: "A Game of Thrones",
    author: "George R.R. Martin",
    cover: "https://covers.openlibrary.org/b/isbn/9780553381689-L.jpg",
    genres: JSON.stringify(["fantasy", "adventure"]),
    totalPages: 694,
    description: "Noble families fight for control of the Iron Throne.",
    series: "A Song of Ice and Fire",
    volume: 1,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    genres: JSON.stringify(["fantasy", "adventure", "classic"]),
    totalPages: 310,
    description: "Bilbo Baggins, a hobbit, joins a wizard on an unexpected journey.",
    series: "Middle-earth",
    volume: 1,
  },
];


async function main() {
  console.log("🌱 Seeding BookVerse database...");

  await prisma.readingSession.deleteMany();
  await prisma.readingProgress.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: { id: "guest", name: "Reader" },
  });
  console.log("✅ Created user:", user.name);

  const createdBooks = [];
  for (const book of BOOKS) {
    const b = await prisma.book.create({ data: book });
    createdBooks.push(b);
    console.log("📚 Added:", b.title);
  }

  const progressData = [
    { bookIndex: 0, currentPage: 154, progress: 0.23 },
    { bookIndex: 1, currentPage: 220, progress: 0.25 },
    { bookIndex: 2, currentPage: 87, progress: 0.45 },
  ];

  for (const pd of progressData) {
    const book = createdBooks[pd.bookIndex];
    await prisma.readingProgress.create({
      data: {
        userId: user.id,
        bookId: book.id,
        progress: pd.progress,
        currentPage: pd.currentPage,
        totalPages: book.totalPages,
        timeSpent: Math.floor(Math.random() * 7200) + 1800,
      },
    });
  }

  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const book = createdBooks[i % createdBooks.length];
    await prisma.readingSession.create({
      data: {
        userId: user.id,
        bookId: book.id,
        date,
        duration: Math.floor(Math.random() * 3600) + 600,
      },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
