export * from './catalog/types';
import { ClassicBook } from './catalog/types';
import { GLOBAL_CLASSIC_BOOKS } from './catalog/allBooks';

export { GLOBAL_CLASSIC_BOOKS };

export function generateClassicsCatalog(): ClassicBook[] {
  return GLOBAL_CLASSIC_BOOKS;
}

export async function fetchLiveGutenbergBook(gutenbergId: number): Promise<{ success: boolean; text: string; source: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://gutendex.com/books/?ids=${gutenbergId}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const book = data.results[0];
        const textUrl = book.formats['text/plain; charset=utf-8'] || 
                         book.formats['text/plain; charset=us-ascii'] || 
                         book.formats['text/plain'] ||
                         book.formats['text/html'];
        
        if (textUrl) {
          try {
            const textRes = await fetch(textUrl);
            if (textRes.ok) {
              const rawText = await textRes.text();
              if (rawText.length > 200) {
                return { success: true, text: rawText, source: `Live Project Gutenberg #${gutenbergId} [Gutendex]` };
              }
            }
          } catch (e) {
            // Text fetch blocked
          }
        }
      }
    }
  } catch (err) {
    // Timeout or network error
  }
  return { success: false, text: '', source: 'Offline Archive Fallback' };
}
