export interface Chapter {
  num: string;
  title: string;
  excerpt: string;
  fullText?: string;
}

export type Region = 'Asia' | 'Europe' | 'Americas' | 'Africa' | 'Middle East' | 'Oceania' | 'Global Ancient';
export type BookLicense = 'Public Domain worldwide' | 'Public Domain (US / Berne)' | 'CC0 1.0 Universal' | 'Open Educational License';

export interface ClassicBook {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  authorLifespan?: string;
  country: string;
  region: Region;
  language: string;
  languageCode: string;
  category: string;
  year: number | string;
  period: 'Ancient' | 'Classical' | 'Medieval' | 'Renaissance' | 'Enlightenment' | '19th Century' | 'Early 20th Century';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Scholar';
  recommendedGrades: string[];
  icon: string;
  coverGradient: string;
  coverAccent: string;
  gutenbergId?: number;
  wordCount: number;
  estimatedReadTime: string;
  description: string;
  themes: string[];
  chapters: Chapter[];
  fullBookText?: string;
  sampleTitle?: string;
  sampleText?: string;
  funFact: string;
  hasFullText?: boolean;
  copyrightStatus: string;
  licenseType: BookLicense;
  source: string;
  sourceUrl?: string;
  readingFormat: string;
  isPopular?: boolean;
  isWorldLiterature?: boolean;
}
