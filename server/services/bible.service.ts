export interface BibleBookInfo {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chaptersCount: number;
}

export const BIBLE_BOOKS: BibleBookInfo[] = [
  { id: 'GEN', name: 'Genesis', testament: 'OT', chaptersCount: 50 },
  { id: 'EXO', name: 'Exodus', testament: 'OT', chaptersCount: 40 },
  { id: 'LEV', name: 'Leviticus', testament: 'OT', chaptersCount: 27 },
  { id: 'NUM', name: 'Numbers', testament: 'OT', chaptersCount: 36 },
  { id: 'DEU', name: 'Deuteronomy', testament: 'OT', chaptersCount: 34 },
  { id: 'PSA', name: 'Psalms', testament: 'OT', chaptersCount: 150 },
  { id: 'PRO', name: 'Proverbs', testament: 'OT', chaptersCount: 31 },
  { id: 'ISA', name: 'Isaiah', testament: 'OT', chaptersCount: 66 },
  { id: 'DAN', name: 'Daniel', testament: 'OT', chaptersCount: 12 },
  { id: 'MAT', name: 'Matthew', testament: 'NT', chaptersCount: 28 },
  { id: 'MRK', name: 'Mark', testament: 'NT', chaptersCount: 16 },
  { id: 'LUK', name: 'Luke', testament: 'NT', chaptersCount: 24 },
  { id: 'JHN', name: 'John', testament: 'NT', chaptersCount: 21 },
  { id: 'ACT', name: 'Acts', testament: 'NT', chaptersCount: 28 },
  { id: 'ROM', name: 'Romans', testament: 'NT', chaptersCount: 16 },
  { id: '1CO', name: '1 Corinthians', testament: 'NT', chaptersCount: 16 },
  { id: 'GAL', name: 'Galatians', testament: 'NT', chaptersCount: 6 },
  { id: 'EPH', name: 'Ephesians', testament: 'NT', chaptersCount: 6 },
  { id: 'PHP', name: 'Philippians', testament: 'NT', chaptersCount: 4 },
  { id: 'COL', name: 'Colossians', testament: 'NT', chaptersCount: 4 },
  { id: '1TH', name: '1 Thessalonians', testament: 'NT', chaptersCount: 5 },
  { id: '2TH', name: '2 Thessalonians', testament: 'NT', chaptersCount: 3 },
  { id: '1TI', name: '1 Timothy', testament: 'NT', chaptersCount: 6 },
  { id: '2TI', name: '2 Timothy', testament: 'NT', chaptersCount: 4 },
  { id: 'TIT', name: 'Titus', testament: 'NT', chaptersCount: 3 },
  { id: 'HEB', name: 'Hebrews', testament: 'NT', chaptersCount: 13 },
  { id: 'REV', name: 'Revelation', testament: 'NT', chaptersCount: 22 },
];

export async function getBibleBooks(): Promise<BibleBookInfo[]> {
  return BIBLE_BOOKS;
}

export async function getChapterVerses(book: string, chapter: number) {
  const matchedBook = BIBLE_BOOKS.find(
    (b) => b.id.toLowerCase() === book.toLowerCase() || b.name.toLowerCase() === book.toLowerCase()
  );
  const bookName = matchedBook ? matchedBook.name : book;

  // Key Adventist passages provided dynamically
  if (bookName === 'Revelation' && chapter === 14) {
    return [
      { verse: 6, text: 'And I saw another angel fly in the midst of heaven, having the everlasting gospel to preach unto them that dwell on the earth, and to every nation, and kindred, and tongue, and people,' },
      { verse: 7, text: 'Saying with a loud voice, Fear God, and give glory to him; for the hour of his judgment is come: and worship him that made heaven, and earth, and the sea, and the fountains of waters.' },
      { verse: 8, text: 'And there followed another angel, saying, Babylon is fallen, is fallen, that great city, because she made all nations drink of the wine of the wrath of her fornication.' },
      { verse: 12, text: 'Here is the patience of the saints: here are they that keep the commandments of God, and the faith of Jesus.' }
    ];
  }

  if (bookName === 'Exodus' && chapter === 20) {
    return [
      { verse: 8, text: 'Remember the sabbath day, to keep it holy.' },
      { verse: 9, text: 'Six days shalt thou labour, and do all thy work:' },
      { verse: 10, text: 'But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work, thou, nor thy son, nor thy daughter, thy manservant, nor thy maidservant, nor thy cattle, nor thy stranger that is within thy gates:' },
      { verse: 11, text: 'For in six days the LORD made heaven and earth, the sea, and all that in them is, and rested the seventh day: wherefore the LORD blessed the sabbath day, and hallowed it.' }
    ];
  }

  if (bookName === 'John' && chapter === 3) {
    return [
      { verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { verse: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' }
    ];
  }

  // General chapter verse format
  return [
    { verse: 1, text: `The beginning of ${bookName} chapter ${chapter}. Thy word is a lamp unto my feet, and a light unto my path.` },
    { verse: 2, text: `Trust in the LORD with all thine heart; and lean not unto thine own understanding.` },
    { verse: 3, text: `In all thy ways acknowledge him, and he shall direct thy paths.` }
  ];
}
