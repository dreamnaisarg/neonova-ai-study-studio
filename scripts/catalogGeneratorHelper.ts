import fs from 'fs';
import path from 'path';

// Helper to sanitize strings for code output
function escapeStr(str: string): string {
  if (!str) return '""';
  return JSON.stringify(str);
}

interface RawBookDef {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  authorLifespan?: string;
  country: string;
  region: 'Asia' | 'Europe' | 'Americas' | 'Africa' | 'Middle East' | 'Oceania' | 'Global Ancient';
  language: string;
  languageCode?: string;
  category: string;
  year: number | string;
  period: 'Ancient' | 'Classical' | 'Medieval' | 'Renaissance' | 'Enlightenment' | '19th Century' | 'Early 20th Century';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Scholar';
  recommendedGrades?: string[];
  icon: string;
  coverGradient?: string;
  coverAccent?: string;
  gutenbergId?: number;
  wordCount?: number;
  estimatedReadTime?: string;
  description: string;
  themes: string[];
  sampleTitle: string;
  sampleText: string;
  funFact?: string;
  copyrightStatus: string;
  licenseType: 'Public Domain worldwide' | 'Public Domain (US / Berne)' | 'CC0 1.0 Universal' | 'Open Educational License';
  source: string;
  sourceUrl?: string;
  readingFormat: string;
  isPopular?: boolean;
  isWorldLiterature?: boolean;
  chapters: Array<{
    num: string;
    title: string;
    excerpt: string;
    fullText?: string;
  }>;
}

export function generateBookCode(b: RawBookDef): string {
  return `  {
    "id": ${escapeStr(b.id)},
    "title": ${escapeStr(b.title)},
    ${b.originalTitle ? `"originalTitle": ${escapeStr(b.originalTitle)},` : ''}
    "author": ${escapeStr(b.author)},
    ${b.authorLifespan ? `"authorLifespan": ${escapeStr(b.authorLifespan)},` : ''}
    "country": ${escapeStr(b.country)},
    "region": ${escapeStr(b.region)},
    "language": ${escapeStr(b.language)},
    ${b.languageCode ? `"languageCode": ${escapeStr(b.languageCode)},` : ''}
    "category": ${escapeStr(b.category)},
    "year": ${typeof b.year === 'number' ? b.year : escapeStr(b.year)},
    "period": ${escapeStr(b.period)},
    "difficulty": ${escapeStr(b.difficulty)},
    "recommendedGrades": ${JSON.stringify(b.recommendedGrades || ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"])},
    "icon": ${escapeStr(b.icon)},
    "coverGradient": ${escapeStr(b.coverGradient || "from-slate-700 via-indigo-900 to-slate-950")},
    "coverAccent": ${escapeStr(b.coverAccent || "border-indigo-400/40 text-indigo-200")},
    ${b.gutenbergId ? `"gutenbergId": ${b.gutenbergId},` : ''}
    "wordCount": ${b.wordCount || 35000},
    "estimatedReadTime": ${escapeStr(b.estimatedReadTime || "2.5 hours")},
    "description": ${escapeStr(b.description)},
    "themes": ${JSON.stringify(b.themes)},
    "sampleTitle": ${escapeStr(b.sampleTitle)},
    "sampleText": ${escapeStr(b.sampleText)},
    ${b.funFact ? `"funFact": ${escapeStr(b.funFact)},` : ''}
    "copyrightStatus": ${escapeStr(b.copyrightStatus)},
    "licenseType": ${escapeStr(b.licenseType)},
    "source": ${escapeStr(b.source)},
    ${b.sourceUrl ? `"sourceUrl": ${escapeStr(b.sourceUrl)},` : ''}
    "readingFormat": ${escapeStr(b.readingFormat)},
    "isPopular": ${b.isPopular ? 'true' : 'false'},
    "isWorldLiterature": ${b.isWorldLiterature ? 'true' : 'false'},
    "chapters": ${JSON.stringify(b.chapters, null, 6)}
  }`;
}
