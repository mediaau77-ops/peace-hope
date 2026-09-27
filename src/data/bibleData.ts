export interface BibleVerse {
  id?: string;
  book: string;
  chapter: number;
  verse: number;
  text: {
    en: string;
    fr: string;
    rw: string;
  };
}

export interface BibleReadingPlan {
  id: string;
  title: string;
  description: string;
  daysTotal: number;
  completedDays: number;
  category: string;
}

// Canonical Scripture Canon definitions (Reference data for database seeding and book selection)
export const BIBLE_BOOKS = [
  // Law / Torah
  { name: 'Genesis', rw: 'Itangiriro', fr: 'Genèse', chapters: 50, testament: 'Old' },
  { name: 'Exodus', rw: 'Kuva', fr: 'Exode', chapters: 40, testament: 'Old' },
  { name: 'Leviticus', rw: 'Abalewi', fr: 'Lévitique', chapters: 27, testament: 'Old' },
  { name: 'Numbers', rw: 'Kubara', fr: 'Nombres', chapters: 36, testament: 'Old' },
  { name: 'Deuteronomy', rw: 'Gutegeka kwa Kabiri', fr: 'Deutéronome', chapters: 34, testament: 'Old' },
  // Wisdom & Prophets
  { name: 'Psalms', rw: 'Zaburi', fr: 'Psaumes', chapters: 150, testament: 'Old' },
  { name: 'Proverbs', rw: 'Imigani', fr: 'Proverbes', chapters: 31, testament: 'Old' },
  { name: 'Isaiah', rw: 'Yesaya', fr: 'Ésaïe', chapters: 66, testament: 'Old' },
  { name: 'Daniel', rw: 'Daniyeli', fr: 'Daniel', chapters: 12, testament: 'Old' },
  // Gospels & Epistles
  { name: 'Matthew', rw: 'Matayo', fr: 'Matthieu', chapters: 28, testament: 'New' },
  { name: 'Mark', rw: 'Mariko', fr: 'Marc', chapters: 16, testament: 'New' },
  { name: 'Luke', rw: 'Luka', fr: 'Luc', chapters: 24, testament: 'New' },
  { name: 'John', rw: 'Yohana', fr: 'Jean', chapters: 21, testament: 'New' },
  { name: 'Acts', rw: 'Ibyakozwe n’Intumwa', fr: 'Actes', chapters: 28, testament: 'New' },
  { name: 'Romans', rw: 'Abaroma', fr: 'Romains', chapters: 16, testament: 'New' },
  { name: 'Hebrews', rw: 'Abaheburayo', fr: 'Hébreux', chapters: 13, testament: 'New' },
  { name: 'Revelation', rw: 'Ibyahishuwe', fr: 'Apocalypse', chapters: 22, testament: 'New' },
];

// Clean datasets — Zero hardcoded mock verses or plans
// All content is stored in and retrieved directly from Supabase tables: bible_verses, bible_books, bible_chapters
export const SAMPLE_VERSES: BibleVerse[] = [];
export const INITIAL_READING_PLANS: BibleReadingPlan[] = [];
