import fs from 'fs';
import path from 'path';

export interface ParsedChapter {
  num: string;
  title: string;
  fullText: string;
  wordCount: number;
}

export interface BookContentResult {
  success: boolean;
  isComplete: boolean;
  message?: string;
  title?: string;
  author?: string;
  source?: string;
  gutenbergId?: number;
  wordCount?: number;
  totalChapters?: number;
  chapters?: ParsedChapter[];
  fullText?: string;
}

const CACHE_DIR = path.join(process.cwd(), 'books_cache');
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch {}
}

// Comprehensive registry of public domain works with authorized Project Gutenberg IDs
export const KNOWN_GUTENBERG_MAPPING: Record<string, number> = {
  // Classics & World Literature (supporting both catalog slugs and standard aliases)
  'sherlock-holmes-doyle': 1661,
  'the-adventures-of-sherlock-holmes': 1661,
  'adventures-sherlock-holmes': 1661,
  'hound-baskervilles-doyle': 2852,
  'the-hound-of-the-baskervilles': 2852,
  'the-memoirs-of-sherlock-holmes': 834,
  'memoirs-of-sherlock-holmes': 834,
  'a-study-in-scarlet': 244,
  'the-sign-of-four': 2097,
  'the-return-of-sherlock-holmes': 108,
  'the-valley-of-fear': 3289,
  'pride-prejudice-austen': 1342,
  'pride-and-prejudice-austen': 1342,
  'pride-and-prejudice': 1342,
  'sense-and-sensibility': 161,
  'emma': 158,
  'persuasion': 105,
  'mansfield-park': 141,
  'northanger-abbey': 121,
  'frankenstein-mary-shelley': 84,
  'frankenstein-shelley': 84,
  'frankenstein': 84,
  'alice-in-wonderland-carroll': 11,
  'alice-wonderland-carroll': 11,
  'through-the-looking-glass': 12,
  'dracula-stoker': 345,
  'dracula': 345,
  'dorian-gray-wilde': 174,
  'the-picture-of-dorian-gray': 174,
  'picture-dorian-gray-wilde': 174,
  'the-importance-of-being-earnest': 844,
  'importance-being-earnest-wilde': 844,
  'time-machine-wells': 35,
  'the-time-machine': 35,
  'war-of-the-worlds-wells': 36,
  'war-of-worlds-wells': 36,
  'the-war-of-the-worlds': 36,
  'the-invisible-man': 5230,
  'the-island-of-doctor-moreau': 159,
  'the-first-men-in-the-moon': 1013,
  'great-expectations': 1400,
  'great-expectations-dickens': 1400,
  'a-tale-of-two-cities': 98,
  'tale-two-cities-dickens': 98,
  'a-christmas-carol': 46,
  'christmas-carol-dickens': 46,
  'oliver-twist': 730,
  'moby-dick-melville': 2701,
  'moby-dick': 2701,
  'jane-eyre': 1260,
  'jane-eyre-bronte': 1260,
  'wuthering-heights': 768,
  'wuthering-heights-bronte': 768,
  'the-metamorphosis': 5200,
  'metamorphosis-kafka': 5200,
  'the-trial': 7849,
  'jungle-book-kipling': 236,
  'the-jungle-book': 236,
  'treasure-island': 120,
  'treasure-island-stevenson': 120,
  'strange-case-of-dr-jekyll-and-mr-hyde': 43,
  'jekyll-hyde-stevenson': 43,
  'the-prince': 1232,
  'the-prince-machiavelli': 1232,
  'discourse-on-the-method': 59,
  'the-social-contract': 46333,
  'republic-plato': 1497,
  'the-republic': 1497,
  'the-apology-of-socrates': 1656,
  'the-symposium': 1600,
  'meditations-marcus-aurelius': 2680,
  'meditations': 2680,
  'walden-or-life-in-the-woods': 205,
  'walden-thoreau': 205,
  'civil-disobedience': 71,
  'civil-disobedience-thoreau': 71,
  'leaves-of-grass-song-of-myself': 1322,
  'leaves-of-grass-whitman': 1322,
  'the-scarlet-letter': 33,
  'scarlet-letter-hawthorne': 33,
  'the-red-badge-of-courage': 73,
  'tom-sawyer-mark-twain': 74,
  'adventures-tom-sawyer-twain': 74,
  'the-adventures-of-tom-sawyer': 74,
  'huckleberry-finn-twain': 76,
  'adventures-of-huckleberry-finn': 76,
  'a-connecticut-yankee-in-king-arthur-s-court': 86,
  'the-prince-and-the-pauper': 1837,
  'crime-and-punishment-dostoevsky': 2554,
  'crime-punishment-dostoyevsky': 2554,
  'the-brothers-karamazov': 28054,
  'brothers-karamazov-dostoyevsky': 28054,
  'the-idiot': 2638,
  'notes-from-underground': 600,
  'war-and-peace-tolstoy': 2600,
  'anna-karenina': 1399,
  'anna-karenina-tolstoy': 1399,
  'the-death-of-ivan-ilyich': 289,
  'the-iliad': 6130,
  'iliad-homer': 6130,
  'odyssey-homer': 1727,
  'the-odyssey': 1727,
  'aeneid-virgil': 228,
  'don-quixote-cervantes': 996,
  'don-quixote': 996,
  'the-divine-comedy-inferno': 8800,
  'divine-comedy-dante': 8800,
  'faust-part-i': 14591,
  'faust-goethe': 14591,
  'les-mis-rables': 135,
  'les-miserables-hugo': 135,
  'the-hunchback-of-notre-dame': 2610,
  'the-count-of-monte-cristo': 1184,
  'count-monte-cristo-dumas': 1184,
  'the-three-musketeers': 1257,
  'three-musketeers-dumas': 1257,
  'twenty-thousand-leagues-verne': 164,
  'around-the-world-verne': 103,
  'around-world-eighty-days-verne': 103,
  'journey-center-earth-verne': 18857,
  'the-mysterious-island': 1268,
  'from-the-earth-to-the-moon': 83,
  'gullivers-travels-swift': 829,
  'robinson-crusoe-defoe': 521,
  'the-call-of-the-wild': 215,
  'call-of-the-wild-london': 215,
  'white-fang': 910,
  'the-sea-wolf': 1068,
  'heart-of-darkness': 219,
  'little-women': 514,
  'wizard-of-oz-baum': 55,
  'the-wonderful-wizard-of-oz': 55,
  'peter-pan': 16,
  'the-secret-garden': 17396,
  'a-little-princess': 146,
  'the-wind-in-the-willows': 289,
  'black-beauty': 271,
  'grimm-fairy-tales': 2591,
  'hans-christian-andersen-s-fairy-tales': 27200,
  'aesop-fables': 11339,
  'frederick-douglass-narrative': 23,
  'up-from-slavery': 2376,
  'the-souls-of-black-folk': 408,
  'raven-poems-poe': 10031,
  'the-tell-tale-heart-and-other-stories': 2148,
  'the-murders-in-the-rue-morgue': 2147,
  'the-fall-of-the-house-of-usher': 932,
  'hamlet-prince-of-denmark': 1524,
  'macbeth': 1533,
  'romeo-and-juliet': 1513,
  'the-tempest': 2235,
  'origin-of-species-darwin': 1228,
  'the-origin-of-species': 1228,
  'the-voyage-of-the-beagle': 944,
  'dialogues-two-sciences-galileo': 37729,
  'sidereus-nuncius-starry-messenger': 46211,
  'the-elements-of-euclid-book-i-plane-geometry': 21076,
  'opticks-treatise-on-light-colors': 33504,
  'principia-newton': 28233,
  'the-posthumous-memoirs-of-br-s-cubas': 54829,

  // Asian, African, Middle Eastern & Global Classics
  'gitanjali-tagore': 7164,
  'the-crescent-moon': 6520,
  'the-home-and-the-world': 7166,
  'sadhana-the-realisation-of-life': 6518,
  'the-post-office-dak-ghar': 30953,
  'kabir-poems-tagore': 6519,
  'bhagavad-gita-edwin-arnold': 2388,
  'the-light-of-asia-life-of-gautama': 2404,
  'hind-swaraj-gandhi': 36856,
  'the-story-of-my-experiments-with-truth': 36856,
  'shakuntala-kalidasa': 16659,
  'meghaduta-the-cloud-messenger': 20875,
  'thirukkural-thiruvalluvar': 38488,
  'arthashastra-chanakya': 34094,
  'upanishads-swami-paramananda': 3283,
  'jataka-tales-cowell': 26713,
  'raja-yoga-vivekananda': 48219,
  'karma-yoga-the-yoga-of-action': 49544,
  'jnana-yoga-the-yoga-of-wisdom': 49545,
  'bhakti-yoga-the-yoga-of-devotion': 49546,
  'the-ramayana-epic-of-rama': 24869,
  'the-mahabharata-the-great-epic': 15474,
  'panchatantra-vishnu-sharma': 30953,
  'indian-fairy-tales': 7128,
  'folk-tales-of-bengal': 38488,
  'vikram-and-the-vampire-tales-of-baital': 2400,
  'art-of-war-sun-tzu': 132,
  'analects-confucius': 3330,
  'tao-te-ching-laozi': 216,
  'book-of-tea-okakura': 769,
  'bushido-nitobe': 12096,
  'japanese-fairy-tales-ozaki': 4018,
  'korean-folk-tales-gale': 4848,
  'rubaiyat-omar-khayyam': 246,
  'arabian-nights-burton': 3435,
  'aladdin-and-the-wonderful-lamp': 2091,
  'ali-baba-and-the-forty-thieves': 2091,
  'the-seven-voyages-of-sinbad': 2091,
  'masnavi-rumi': 10471,
  'gulistan-sadi': 37063,
  'the-bustan-of-sa-di-the-orchard': 37063,
  'the-divan-of-hafez-ghazals-of-hafiz': 9635,
  'the-code-of-hammurabi': 32356,
  'the-tale-of-genji-selected-tales': 4019,
  'narrow-road-basho': 4019,
  'the-works-of-mencius': 40375,
  'a-japanese-boy-childhood-in-edo': 17083,
  'chinese-folk-lore-tales': 45484,
  'the-classic-of-poetry-book-of-songs': 968,
  'water-margin-all-men-are-brothers': 15210,
  'journey-to-the-west-monkey-king-lore': 12480,
  'romance-three-kingdoms': 12480,
  'hikayat-hang-tuah-malacca-chronicles': 2091,
  'ancient-egyptian-legends': 10557,
  'egyptian-book-of-dead': 2845,
  'the-great-hymn-to-the-aten': 2845,
  'ptahhotep-maxims': 2845,
  'folk-stories-from-southern-nigeria': 25033,
  'west-african-folktales': 25033,
  'yoruba-legends': 25033,
  'south-african-folk-tales': 4275,
  'specimens-bushman-folklore': 63148,
  'kebra-nagast-the-glory-of-kings': 38595,
  'epic-of-gilgamesh': 11000,
  'popol-vuh-maya': 55225,
  'brazilian-folk-stories-and-legends': 4275,
  'legends-of-maui-and-the-south-seas': 26161,
  'hawaiian-legends-of-volcanoes': 24918,
  'aboriginal-legends-smith': 2599,
  'maori-lore-cowan': 26161,
  'we-of-the-never-never-outback-lore': 2599
};

/**
 * Clean Project Gutenberg headers and footers to keep the pure unabridged text
 */
export function cleanGutenbergText(raw: string): string {
  let cleaned = (raw || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Trim start header
  const startMatch = cleaned.match(/\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*/i);
  if (startMatch && startMatch.index !== undefined) {
    cleaned = cleaned.slice(startMatch.index + startMatch[0].length);
  }

  // Trim end footer
  const endMatch = cleaned.match(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\*]*\*\*\*/i) ||
                   cleaned.match(/End of the Project Gutenberg/i);
  if (endMatch && endMatch.index !== undefined) {
    cleaned = cleaned.slice(0, endMatch.index);
  }

  return cleaned.trim();
}

/**
 * Automatically parses raw unabridged book text into structured, named chapters
 */
export function parseChaptersFromText(rawText: string, bookTitle: string): ParsedChapter[] {
  const cleaned = cleanGutenbergText(rawText);
  if (!cleaned || cleaned.length < 100) return [];

  // Patterns for detecting chapters:
  // e.g. "CHAPTER 1", "CHAPTER I", "STAVE ONE", "ACT I", "BOOK FIRST", "I. A SCANDAL IN BOHEMIA"
  const chapterRegex = /(?:^|\n\n+)(?:(CHAPTER\s+[0-9IVXLCDM\w]+(?:[.:\s—\-]+[^\n]+)?)|(STAVE\s+[0-9IVXLCDM\w]+(?:[.:\s—\-]+[^\n]+)?)|(ACT\s+[0-9IVXLCDM]+(?:[.:\s—\-]+[^\n]+)?)|(BOOK\s+(?:THE\s+)?[0-9IVXLCDM\w]+(?:[.:\s—\-]+[^\n]+)?)|(PART\s+[0-9IVXLCDM\w]+(?:[.:\s—\-]+[^\n]+)?)|(PREFACE|PROLOGUE|INTRODUCTION|EPILOGUE)|([IVXLCDM]+\.\s+[A-Z0-9\s'’—\-]{3,60}))(?=\n\n)/gi;

  const matches: { index: number; fullMatch: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = chapterRegex.exec(cleaned)) !== null) {
    matches.push({ index: m.index, fullMatch: m[0].trim() });
  }

  // If chapter delimiters found and count is reasonable (>= 2)
  if (matches.length >= 2) {
    // Filter out TOC duplicates: if the first few matches appear within first 2500 characters
    // and reappear later, discard the initial table of contents matches
    let filteredMatches = matches;
    if (matches[0].index < 2500 && matches.length > 5) {
      // Find where main body starts if duplicate TOC exists
      const bodyCandidateIndex = cleaned.indexOf(matches[0].fullMatch, matches[0].index + matches[0].fullMatch.length + 500);
      if (bodyCandidateIndex !== -1 && bodyCandidateIndex < 12000) {
        filteredMatches = matches.filter(match => match.index >= bodyCandidateIndex);
        if (filteredMatches.length === 0) filteredMatches = matches;
      }
    }

    const chapters: ParsedChapter[] = [];

    // Optional Preface / Introduction before Chapter 1 if substantial (> 400 chars)
    if (filteredMatches[0].index > 400) {
      const introText = cleaned.slice(0, filteredMatches[0].index).trim();
      if (introText.length > 300) {
        chapters.push({
          num: 'Intro',
          title: 'Title & Preamble',
          fullText: introText,
          wordCount: introText.split(/\s+/).length
        });
      }
    }

    for (let i = 0; i < filteredMatches.length; i++) {
      const current = filteredMatches[i];
      const next = filteredMatches[i + 1];
      const startText = current.index;
      const endText = next ? next.index : cleaned.length;
      const chapterContent = cleaned.slice(startText, endText).trim();

      // Separate heading from body
      const firstLineBreak = chapterContent.indexOf('\n');
      let titleHeader = current.fullMatch.replace(/\n/g, ' ').trim();
      let bodyText = chapterContent;

      if (firstLineBreak !== -1) {
        titleHeader = chapterContent.slice(0, firstLineBreak).trim();
        bodyText = chapterContent.slice(firstLineBreak).trim();
      }

      // Format chapter number and subtitle
      let num = `Chapter ${i + 1}`;
      let title = titleHeader;

      const colonIdx = titleHeader.indexOf(':') !== -1 ? titleHeader.indexOf(':') : titleHeader.indexOf('—');
      if (colonIdx !== -1) {
        num = titleHeader.slice(0, colonIdx).trim();
        title = titleHeader.slice(colonIdx + 1).trim();
      } else if (/^[IVXLCDM]+\.\s+/i.test(titleHeader)) {
        const dotIdx = titleHeader.indexOf('.');
        num = `Part ${titleHeader.slice(0, dotIdx).trim()}`;
        title = titleHeader.slice(dotIdx + 1).trim();
      }

      if (!title || title === num) {
        title = `Section ${i + 1}`;
      }

      if (bodyText.length > 50) {
        chapters.push({
          num,
          title,
          fullText: bodyText,
          wordCount: bodyText.split(/\s+/).length
        });
      }
    }

    if (chapters.length > 0) {
      return chapters;
    }
  }

  // Fallback: If no explicit chapter headers exist (e.g. poetry collections, ancient texts, or single-chapter works)
  // Partition into continuous sections of ~1,500 words at paragraph breaks
  const paragraphs = cleaned.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  const chapters: ParsedChapter[] = [];
  let currentChunk: string[] = [];
  let currentWords = 0;
  let sectionIndex = 1;

  for (const p of paragraphs) {
    const pWords = p.split(/\s+/).length;
    currentChunk.push(p);
    currentWords += pWords;

    if (currentWords >= 1600) {
      const sectionText = currentChunk.join('\n\n');
      chapters.push({
        num: `Section ${sectionIndex}`,
        title: `Part ${sectionIndex} (${currentWords} words)`,
        fullText: sectionText,
        wordCount: currentWords
      });
      sectionIndex++;
      currentChunk = [];
      currentWords = 0;
    }
  }

  if (currentChunk.length > 0) {
    const sectionText = currentChunk.join('\n\n');
    chapters.push({
      num: `Section ${sectionIndex}`,
      title: sectionIndex === 1 ? bookTitle : `Part ${sectionIndex}`,
      fullText: sectionText,
      wordCount: sectionText.split(/\s+/).length
    });
  }

  return chapters;
}

/**
 * Fetch and retrieve complete book text from authorized public domain mirrors
 */
export async function fetchCompleteBookText(options: {
  bookId: string;
  gutenbergId?: number;
  title?: string;
  author?: string;
}): Promise<BookContentResult> {
  const { bookId, title = 'Classic Book', author = 'Author' } = options;
  const gbId = options.gutenbergId || KNOWN_GUTENBERG_MAPPING[bookId];

  // 1. Check disk cache first
  const cacheFile = path.join(CACHE_DIR, `${gbId || bookId}.txt`);
  const metaFile = path.join(CACHE_DIR, `${gbId || bookId}_parsed.json`);

  if (fs.existsSync(metaFile) && fs.existsSync(cacheFile)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
      const text = fs.readFileSync(cacheFile, 'utf-8');
      return {
        success: true,
        isComplete: true,
        title,
        author,
        gutenbergId: gbId,
        source: meta.source || `Project Gutenberg Archive #${gbId}`,
        wordCount: meta.wordCount || text.split(/\s+/).length,
        totalChapters: meta.chapters ? meta.chapters.length : 1,
        chapters: meta.chapters,
        fullText: text
      };
    } catch (e) {
      // Continue to live fetch if cache corrupted
    }
  }

  // 2. If gutenberg ID is available, fetch live from authorized Project Gutenberg mirrors
  if (gbId) {
    const urls = [
      `https://www.gutenberg.org/cache/epub/${gbId}/pg${gbId}.txt`,
      `https://www.gutenberg.org/files/${gbId}/${gbId}-0.txt`,
      `https://www.gutenberg.org/files/${gbId}/${gbId}.txt`
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'NeoNova-Educational-Hub/2.0 (Public Domain Student Research)'
          }
        });
        clearTimeout(timeout);

        if (res.ok) {
          const raw = await res.text();
          if (raw && raw.length > 500) {
            const cleaned = cleanGutenbergText(raw);
            const chapters = parseChaptersFromText(cleaned, title);
            const wordCount = cleaned.split(/\s+/).length;

            // Cache to disk
            try {
              fs.writeFileSync(cacheFile, cleaned, 'utf-8');
              fs.writeFileSync(metaFile, JSON.stringify({
                bookId,
                gutenbergId: gbId,
                source: `Project Gutenberg Archive #${gbId} (Unabridged Public Domain)`,
                wordCount,
                chapters
              }), 'utf-8');
            } catch (err) {
              console.warn('Failed to cache book to disk', err);
            }

            return {
              success: true,
              isComplete: true,
              title,
              author,
              gutenbergId: gbId,
              source: `Project Gutenberg Archive #${gbId} (Unabridged Public Domain)`,
              wordCount,
              totalChapters: chapters.length,
              chapters,
              fullText: cleaned
            };
          }
        }
      } catch (err) {
        // Try next mirror
      }
    }
  }

  // 3. If no authorized full text could be obtained
  return {
    success: false,
    isComplete: false,
    message: 'The complete text is not available from this authorized source.',
    title,
    author
  };
}
