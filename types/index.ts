export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  epubUrl?: string | null;
  description?: string | null;
  genres: string[];
  totalPages: number;
  series?: string | null;
  volume?: number | null;
  createdAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  progress: number;
  lastCfi?: string | null;
  currentPage: number;
  totalPages: number;
  timeSpent: number;
  lastExcerpt?: string | null;
  updatedAt: string;
  book?: Book;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  date: string;
  duration: number;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface User {
  id: string;
  name: string;
  avatar?: string | null;
  dailyGoalMins?: number;
}

export type ReaderTheme = "light" | "dark" | "sepia";

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  first_publish_year?: number;
}
