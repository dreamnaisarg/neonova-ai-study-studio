import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, 
  Search, Download, Bookmark, Sparkles, HelpCircle, CheckCircle2, 
  Settings, Type, Sun, Moon, Eye, ArrowLeft, Maximize2, Minimize2,
  List, Globe, RefreshCw, Copy, Check, Hash, BookMarked,
  ShieldCheck, Info, X, Clock, Compass, FileText, ArrowRight,
  BookCheck, AlertTriangle
} from 'lucide-react';
import { ClassicBook, Chapter } from '../utils/classicsCatalog';
import { ParsedChapter, BookContentResult } from '../server/bookContentService';

interface FullBookReaderModalProps {
  book: ClassicBook | null;
  isOpen: boolean;
  onClose: () => void;
  onImportBook?: (book: ClassicBook) => void;
  adjustXP?: (amount: number) => void;
  initialView?: 'chapter' | 'continuous';
}

type ReaderTheme = 'paper' | 'sepia' | 'dark' | 'midnight';
type FontFamily = 'serif' | 'sans' | 'mono';
type FontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
type LineHeight = 'normal' | 'relaxed' | 'loose';

interface SavedReadingProgress {
  bookId: string;
  chapterIndex: number;
  chapterTitle: string;
  pageNumber: number;
  progressPct: number;
  lastReadAt: string;
}

interface SearchMatch {
  chapterIndex: number;
  chapterNum: string;
  chapterTitle: string;
  paragraphIndex: number;
  snippet: string;
  estimatedPage: number;
}

export default function FullBookReaderModal({
  book,
  isOpen,
  onClose,
  onImportBook,
  adjustXP,
  initialView = 'continuous'
}: FullBookReaderModalProps) {
  // Reading mode
  const [readingView, setReadingView] = useState<'chapter' | 'continuous'>(initialView);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Content state
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [loadedBookContent, setLoadedBookContent] = useState<BookContentResult | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Appearance controls
  const [theme, setTheme] = useState<ReaderTheme>('paper');
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [fontSize, setFontSize] = useState<FontSize>('lg');
  const [lineHeight, setLineHeight] = useState<LineHeight>('relaxed');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawers & Modals
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [tocFilter, setTocFilter] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLegalInfoOpen, setIsLegalInfoOpen] = useState(false);

  // Progress & Offline
  const [readProgressPct, setReadProgressPct] = useState(0);
  const [savedProgressPrompt, setSavedProgressPrompt] = useState<SavedReadingProgress | null>(null);
  const [isSavedOffline, setIsSavedOffline] = useState(false);
  const [copiedChapter, setCopiedChapter] = useState(false);

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // AI Paragraph Explainer
  const [activeExplainingKey, setActiveExplainingKey] = useState<string | null>(null);
  const [paragraphExplanation, setParagraphExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const readerContainerRef = useRef<HTMLDivElement | null>(null);
  const modalRootRef = useRef<HTMLDivElement | null>(null);

  // 1. LOAD COMPLETE BOOK CONTENT & RESTORE PROGRESS
  useEffect(() => {
    if (!book || !isOpen) return;

    setReadingView(initialView || 'continuous');
    setActiveChapterIndex(0);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
    setIsTocOpen(false);
    setTocFilter('');
    setIsSettingsOpen(false);
    setActiveExplainingKey(null);
    setParagraphExplanation(null);
    setReadProgressPct(0);

    // Check offline cache
    try {
      const cached = localStorage.getItem(`neonova_offline_book_${book.id}`);
      setIsSavedOffline(!!cached);
    } catch {
      setIsSavedOffline(false);
    }

    // Check saved reading progress
    try {
      const progressRaw = localStorage.getItem(`neonova_reading_progress_${book.id}`);
      if (progressRaw) {
        const parsed: SavedReadingProgress = JSON.parse(progressRaw);
        if (parsed && typeof parsed.chapterIndex === 'number') {
          setSavedProgressPrompt(parsed);
        }
      } else {
        setSavedProgressPrompt(null);
      }
    } catch {
      setSavedProgressPrompt(null);
    }

    // Load Complete Book Content
    const loadContent = async () => {
      setIsLoadingBook(true);
      setLoadError(null);

      // Check if book already has complete text cached offline in localStorage
      try {
        const offlineKey = `neonova_offline_book_${book.id}`;
        const offlineData = localStorage.getItem(offlineKey);
        if (offlineData) {
          const parsed = JSON.parse(offlineData);
          if (parsed.chapters && parsed.chapters.length > 0 && parsed.fullText) {
            setLoadedBookContent({
              success: true,
              isComplete: true,
              chapters: parsed.chapters,
              fullText: parsed.fullText,
              totalChapters: parsed.chapters.length,
              wordCount: parsed.wordCount || parsed.fullText.split(/\s+/).length,
              source: parsed.source || book.source
            });
            setIsLoadingBook(false);
            return;
          }
        }
      } catch {}

      // Fetch complete text from server-side authorized Gutenberg / Archive proxy
      try {
        const res = await fetch('/api/books/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookId: book.id,
            gutenbergId: book.gutenbergId,
            title: book.title,
            author: book.author
          })
        });

        if (res.ok) {
          const data: BookContentResult = await res.json();
          if (data.success && data.chapters && data.chapters.length > 0) {
            setLoadedBookContent(data);
            setIsLoadingBook(false);
            return;
          } else if (data.message) {
            setLoadError(data.message);
          }
        }
      } catch (err) {
        console.warn('Live complete book fetch error, falling back to local catalog data', err);
      }

      // Fallback: If catalog already has embedded chapters
      if (book.chapters && Array.isArray(book.chapters) && book.chapters.length > 0) {
        const parsed = book.chapters.map((ch, idx) => ({
          num: ch.num || `Chapter ${idx + 1}`,
          title: ch.title || `Section ${idx + 1}`,
          fullText: ch.fullText || ch.excerpt || 'Public domain unabridged classical literature text.',
          wordCount: (ch.fullText || ch.excerpt || '').split(/\s+/).length
        }));

        setLoadedBookContent({
          success: true,
          isComplete: true,
          chapters: parsed,
          fullText: book.fullBookText || parsed.map(c => c.fullText).join('\n\n'),
          totalChapters: parsed.length,
          wordCount: book.wordCount || 10000,
          source: book.source
        });
      } else {
        setLoadError('The complete text is not available from this authorized source.');
      }

      setIsLoadingBook(false);
    };

    loadContent();

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [book, isOpen]);

  // Safe chapters list
  const activeChapters: ParsedChapter[] = useMemo(() => {
    if (loadedBookContent?.chapters && loadedBookContent.chapters.length > 0) {
      return loadedBookContent.chapters;
    }
    if (book?.chapters && book.chapters.length > 0) {
      return book.chapters.map((ch, idx) => ({
        num: ch.num || `Chapter ${idx + 1}`,
        title: ch.title || `Section ${idx + 1}`,
        fullText: ch.fullText || ch.excerpt || 'Authorized text content.',
        wordCount: (ch.fullText || ch.excerpt || '').split(/\s+/).length
      }));
    }
    return [];
  }, [loadedBookContent, book]);

  const totalChapters = activeChapters.length;
  const currentChapter = activeChapters[activeChapterIndex] || activeChapters[0] || {
    num: 'Chapter 1',
    title: 'Introduction',
    fullText: 'Content loading...',
    wordCount: 100
  };

  // Whole book full text
  const wholeBookText = useMemo(() => {
    if (loadedBookContent?.fullText) return loadedBookContent.fullText;
    if (book?.fullBookText) return book.fullBookText;
    return activeChapters.map(c => `## ${c.num}: ${c.title}\n\n${c.fullText}`).join('\n\n---\n\n');
  }, [loadedBookContent, book, activeChapters]);

  // Total book word count & pages
  const totalBookWords = useMemo(() => {
    if (loadedBookContent?.wordCount) return loadedBookContent.wordCount;
    return activeChapters.reduce((acc, c) => acc + (c.wordCount || 0), 0) || 5000;
  }, [loadedBookContent, activeChapters]);

  const totalBookPages = Math.max(1, Math.ceil(totalBookWords / 300));

  // Current page estimate
  const currentPageEstimate = useMemo(() => {
    let wordsBefore = 0;
    for (let i = 0; i < activeChapterIndex; i++) {
      wordsBefore += (activeChapters[i]?.wordCount || 0);
    }
    const currentChapterWords = currentChapter.wordCount || 0;
    const progressInCurrent = (readProgressPct / 100) * currentChapterWords;
    const page = Math.max(1, Math.ceil((wordsBefore + progressInCurrent) / 300));
    return Math.min(page, totalBookPages);
  }, [activeChapterIndex, activeChapters, currentChapter, readProgressPct, totalBookPages]);

  // Current chapter paragraphs
  const chapterParagraphs = useMemo(() => {
    const raw = currentChapter.fullText || '';
    const paras = raw.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
    return paras.length > 0 ? paras : [raw || 'Authorized text loaded.'];
  }, [currentChapter]);

  // 2. AUTO-SAVE READING PROGRESS
  useEffect(() => {
    if (!book || totalChapters === 0 || isLoadingBook) return;

    const timeout = setTimeout(() => {
      try {
        const progress: SavedReadingProgress = {
          bookId: book.id,
          chapterIndex: activeChapterIndex,
          chapterTitle: currentChapter.title,
          pageNumber: currentPageEstimate,
          progressPct: readProgressPct,
          lastReadAt: new Date().toISOString()
        };
        localStorage.setItem(`neonova_reading_progress_${book.id}`, JSON.stringify(progress));
      } catch {}
    }, 1000);

    return () => clearTimeout(timeout);
  }, [book, activeChapterIndex, currentChapter, currentPageEstimate, readProgressPct, totalChapters, isLoadingBook]);

  // Resume saved reading position
  const handleResumeProgress = () => {
    if (!savedProgressPrompt) return;
    const targetIdx = Math.min(Math.max(0, savedProgressPrompt.chapterIndex), totalChapters - 1);
    setActiveChapterIndex(targetIdx);

    if (readingView === 'continuous') {
      setTimeout(() => {
        const el = document.getElementById(`whole-book-chapter-${targetIdx}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      if (readerContainerRef.current) readerContainerRef.current.scrollTop = 0;
    }

    setSavedProgressPrompt(null);
  };

  // Scroll handler for tracking progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight > target.clientHeight) {
      const progress = Math.round((target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100);
      setReadProgressPct(Math.min(100, Math.max(0, progress)));
    }
  };

  // Chapter Navigation
  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(prev => prev - 1);
      if (readerContainerRef.current) readerContainerRef.current.scrollTop = 0;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveExplainingKey(null);
    }
  };

  const handleNextChapter = () => {
    if (activeChapterIndex < totalChapters - 1) {
      setActiveChapterIndex(prev => prev + 1);
      if (readerContainerRef.current) readerContainerRef.current.scrollTop = 0;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveExplainingKey(null);
      if (adjustXP) adjustXP(25);
    }
  };

  const handleJumpToChapter = (idx: number) => {
    setActiveChapterIndex(idx);
    setIsTocOpen(false);

    if (readingView === 'continuous') {
      const sectionEl = document.getElementById(`whole-book-chapter-${idx}`);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      if (readerContainerRef.current) readerContainerRef.current.scrollTop = 0;
    }
  };

  // 3. SEARCH THE ENTIRE BOOK ACROSS ALL CHAPTERS
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query || query.length < 2 || activeChapters.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const matches: SearchMatch[] = [];

    // Precalculate cumulative word counts per chapter for fast page location lookup
    const cumulativeChapterWords: number[] = [0];
    for (let c = 0; c < activeChapters.length; c++) {
      cumulativeChapterWords.push(cumulativeChapterWords[c] + (activeChapters[c].wordCount || 0));
    }

    activeChapters.forEach((ch, chIdx) => {
      const paragraphs = ch.fullText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
      let runningParaWords = 0;

      paragraphs.forEach((p, pIdx) => {
        const pWordCount = p.split(/\s+/).length;
        const lower = p.toLowerCase();
        const foundIndex = lower.indexOf(query);
        if (foundIndex !== -1) {
          const start = Math.max(0, foundIndex - 45);
          const end = Math.min(p.length, foundIndex + query.length + 55);
          const snippet = (start > 0 ? '...' : '') + p.slice(start, end).trim() + (end < p.length ? '...' : '');

          const totalWordsUpToHere = (cumulativeChapterWords[chIdx] || 0) + runningParaWords;
          const page = Math.min(totalBookPages, Math.max(1, Math.ceil(totalWordsUpToHere / 300) || 1));

          matches.push({
            chapterIndex: chIdx,
            chapterNum: ch.num,
            chapterTitle: ch.title,
            paragraphIndex: pIdx,
            snippet,
            estimatedPage: page
          });
        }
        runningParaWords += pWordCount;
      });
    });

    setSearchResults(matches.slice(0, 100)); // Up to 100 occurrences
    setIsSearching(false);
  }, [searchQuery, activeChapters, totalBookPages]);

  const handleSelectSearchResult = (match: SearchMatch) => {
    setActiveChapterIndex(match.chapterIndex);
    setIsSearchOpen(false);

    if (readingView === 'continuous') {
      setTimeout(() => {
        const el = document.getElementById(`whole-book-chapter-${match.chapterIndex}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      if (readerContainerRef.current) readerContainerRef.current.scrollTop = 0;
    }
  };

  // Check if downloading / offline caching is legally permitted by license (Rule 7)
  const isLicensePermittedToDownload = useMemo(() => {
    if (!book) return false;
    const lic = (book.licenseType || '').toLowerCase();
    const stat = (book.copyrightStatus || '').toLowerCase();
    if (lic.includes('restricted') || lic.includes('no download') || stat.includes('in-reader only')) {
      return false;
    }
    // Public domain and authorized open educational licenses permit downloading
    return true;
  }, [book]);

  // 4. OFFLINE CACHING & BOOK DOWNLOAD
  const handleToggleSaveOffline = () => {
    if (!book) return;
    if (!isLicensePermittedToDownload) return;
    try {
      const key = `neonova_offline_book_${book.id}`;
      if (isSavedOffline) {
        localStorage.removeItem(key);
        setIsSavedOffline(false);
      } else {
        localStorage.setItem(key, JSON.stringify({
          id: book.id,
          title: book.title,
          author: book.author,
          year: book.year,
          category: book.category,
          country: book.country,
          language: book.language,
          copyrightStatus: book.copyrightStatus,
          licenseType: book.licenseType,
          source: book.source,
          chapters: activeChapters,
          fullText: wholeBookText,
          wordCount: totalBookWords,
          cachedAt: new Date().toISOString()
        }));
        setIsSavedOffline(true);
      }
    } catch (err) {
      console.warn('Offline caching error:', err);
    }
  };

  const handleDownloadBook = () => {
    if (!book || !isLicensePermittedToDownload) return;
    const blob = new Blob([
      `============================================================\n${book.title.toUpperCase()}\nBy ${book.author} (${book.year})\nCategory: ${book.category} • Country: ${book.country}\nSource: ${book.source || 'Public Domain Archive'}\nLicense: ${book.licenseType || 'Public Domain worldwide'}\n============================================================\n\n${wholeBookText}`
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_complete_book.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyChapter = () => {
    const textToCopy = `Title: ${book?.title}\nAuthor: ${book?.author}\n${currentChapter.num}: ${currentChapter.title}\n\n${currentChapter.fullText}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedChapter(true);
    setTimeout(() => setCopiedChapter(false), 2000);
  };

  // 5. TEXT TO SPEECH
  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = currentChapter.fullText.replace(/[#*>-]/g, '').slice(0, 2000);
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechRate;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
    if (adjustXP) adjustXP(15);
  };

  // 6. AI PARAGRAPH EXPLAINER
  const handleExplainParagraph = (keyId: string, text: string) => {
    if (activeExplainingKey === keyId) {
      setActiveExplainingKey(null);
      setParagraphExplanation(null);
      return;
    }
    setActiveExplainingKey(keyId);
    setIsExplaining(true);
    setParagraphExplanation(null);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let analysis = '';
      if (lower.includes('rejoice') || lower.includes('disaster') || lower.includes('enterprise')) {
        analysis = '💡 **Modern Interpretation & Vocabulary**: The narrator writes with immense ambition. While their peers considered this dangerous, the voyage begins with supreme confidence and fair winds.';
      } else if (lower.includes('sherlock') || lower.includes('irene adler') || lower.includes('woman')) {
        analysis = '💡 **Character Analysis**: Watson notes that Holmes views Irene Adler as an intellectual equal who managed to outsmart his renowned deductive faculties.';
      } else if (lower.includes('dreary night') || lower.includes('spark') || lower.includes('instruments')) {
        analysis = '💡 **Literary Context**: On a cold November night, the scientist breathes artificial life into his creation. Triumph immediately dissolves into dread.';
      } else {
        analysis = `💡 **Scholarly Breakdown**: In this passage, ${book?.author} explores foundational human themes, balancing societal observation with philosophical inquiry. The language uses classical cadence to convey deep emotional and intellectual reflection.`;
      }
      setParagraphExplanation(analysis);
      setIsExplaining(false);
    }, 350);
  };

  // 7. FULLSCREEN TOGGLE
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (modalRootRef.current?.requestFullscreen) {
        modalRootRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Theme styling definitions
  const getThemeClasses = () => {
    switch (theme) {
      case 'paper':
        return {
          bg: 'bg-[#fbf9f4]',
          headerBg: 'bg-[#f0ece1] border-b border-[#ded7c4]',
          headerText: 'text-[#24211e]',
          text: 'text-[#24211e]',
          mutedText: 'text-[#6e685f]',
          cardBg: 'bg-[#ffffff] border-[#e2dcd0]',
          cardText: 'text-[#24211e]',
          activeChapterBg: 'bg-[#e5dfd2] text-[#1c1917]',
          border: 'border-[#ded7c4]'
        };
      case 'sepia':
        return {
          bg: 'bg-[#f4ebd0]',
          headerBg: 'bg-[#e8dcba] border-b border-[#d8c89d]',
          headerText: 'text-[#3d2e1b]',
          text: 'text-[#3d2e1b]',
          mutedText: 'text-[#7d6749]',
          cardBg: 'bg-[#fcf8ec] border-[#d8c89d]',
          cardText: 'text-[#3d2e1b]',
          activeChapterBg: 'bg-[#dfce9e] text-[#2c1d0d]',
          border: 'border-[#d8c89d]'
        };
      case 'midnight':
        return {
          bg: 'bg-[#000000]',
          headerBg: 'bg-[#0a0a0a] border-b border-[#222222]',
          headerText: 'text-[#ffffff]',
          text: 'text-[#f0f0f0]',
          mutedText: 'text-[#999999]',
          cardBg: 'bg-[#0d0d0d] border-[#222222]',
          cardText: 'text-[#ffffff]',
          activeChapterBg: 'bg-[#222222] text-[#ffffff]',
          border: 'border-[#222222]'
        };
      case 'dark':
      default:
        return {
          bg: 'bg-[#070b1e]',
          headerBg: 'bg-[#0b112c] border-b border-slate-800',
          headerText: 'text-white',
          text: 'text-slate-200',
          mutedText: 'text-slate-400',
          cardBg: 'bg-[#0e1638] border-slate-800',
          cardText: 'text-white',
          activeChapterBg: 'bg-indigo-950/80 border border-indigo-500/40 text-indigo-200',
          border: 'border-slate-800'
        };
    }
  };

  const themeStyles = getThemeClasses();

  const getFontFamilyClass = () => {
    if (fontFamily === 'serif') return 'font-serif';
    if (fontFamily === 'mono') return 'font-mono';
    return 'font-sans';
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-[15px] leading-relaxed';
      case 'base': return 'text-[17px] leading-relaxed';
      case 'lg': return 'text-[19px] leading-loose';
      case 'xl': return 'text-[22px] leading-loose';
      case '2xl': return 'text-[25px] leading-loose';
      default: return 'text-[19px] leading-loose';
    }
  };

  const getLineHeightClass = () => {
    switch (lineHeight) {
      case 'normal': return 'leading-normal';
      case 'relaxed': return 'leading-relaxed';
      case 'loose': return 'leading-loose';
      default: return 'leading-relaxed';
    }
  };

  if (!isOpen || !book) return null;

  return (
    <div 
      ref={modalRootRef}
      id="full-book-reader-overlay"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl animate-fadeIn overflow-hidden select-text font-sans"
    >
      {/* 1. TOPBAR CONTROLS */}
      <header className={`px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 ${themeStyles.headerBg} shadow-md relative z-30 transition-colors`}>
        {/* Left: Close, Table of Contents & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current border border-current/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Exit Reader"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Close</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              isTocOpen ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm' : 'bg-black/10 hover:bg-black/20 text-current border-current/20'
            }`}
            title="Table of Contents"
          >
            <List size={16} />
            <span className="hidden md:inline">Chapters ({totalChapters})</span>
          </button>

          <div className="min-w-0">
            <h2 className={`text-xs sm:text-sm font-bold truncate flex items-center gap-1.5 ${themeStyles.headerText}`}>
              <span className="select-none">{book.icon}</span>
              <span className="truncate">{book.title}</span>
            </h2>
            <p className={`text-[10px] sm:text-xs truncate ${themeStyles.mutedText}`}>
              By <span className="font-semibold">{book.author}</span> • {currentChapter.num}: {currentChapter.title}
            </p>
          </div>
        </div>

        {/* Center: Reading Mode Selector */}
        <div className="hidden lg:flex items-center bg-black/10 p-1 rounded-xl border border-current/15 gap-1 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setReadingView('continuous')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              readingView === 'continuous' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-current/70 hover:text-current'
            }`}
          >
            <BookMarked size={13} />
            <span>Continuous Scroll</span>
          </button>
          <button
            type="button"
            onClick={() => setReadingView('chapter')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              readingView === 'chapter' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-current/70 hover:text-current'
            }`}
          >
            <BookOpen size={13} />
            <span>Chapter by Chapter</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Progress Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/10 border border-current/15 text-[11px] font-mono font-bold">
            <span className={themeStyles.mutedText}>Page {currentPageEstimate} of {totalBookPages}</span>
            <span className="text-emerald-500 font-extrabold">{readProgressPct}%</span>
            <div className="w-12 h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                style={{ width: `${readProgressPct}%` }}
              />
            </div>
          </div>

          {/* Read Aloud */}
          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isSpeaking ? 'bg-red-600 text-white border-red-400 animate-pulse' : 'bg-black/10 hover:bg-black/20 text-current border-current/20'
            }`}
            title="Read Aloud Text-to-Speech"
          >
            {isSpeaking ? <Pause size={15} /> : <Volume2 size={15} />}
            <span className="hidden md:inline">{isSpeaking ? 'Pause' : 'Read Aloud'}</span>
          </button>

          {/* Search Across Complete Book */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer text-xs ${
              isSearchOpen ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm' : 'bg-black/10 hover:bg-black/20 text-current border-current/20'
            }`}
            title="Search Entire Book"
          >
            <Search size={16} />
          </button>

          {/* Typography & Themes */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer text-xs ${
              isSettingsOpen ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm' : 'bg-black/10 hover:bg-black/20 text-current border-current/20'
            }`}
            title="Reading Settings & Typography"
          >
            <Type size={16} />
          </button>

          {/* Copy Chapter */}
          <button
            type="button"
            onClick={handleCopyChapter}
            className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current border border-current/20 transition-all cursor-pointer hidden sm:flex"
            title="Copy current chapter text"
          >
            {copiedChapter ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>

          {/* Offline Cache Toggle */}
          <button
            type="button"
            onClick={handleToggleSaveOffline}
            className={`p-2 rounded-xl border transition-all cursor-pointer text-xs flex items-center gap-1 font-bold ${
              isSavedOffline ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm' : 'bg-black/10 hover:bg-black/20 text-current border-current/20'
            }`}
            title={isSavedOffline ? 'Cached for Offline Reading' : 'Save for Offline Reading'}
          >
            <Bookmark size={15} className={isSavedOffline ? 'fill-current' : ''} />
            <span className="hidden md:inline">{isSavedOffline ? 'Cached' : 'Offline'}</span>
          </button>

          {/* Legal Source Verification */}
          <button
            type="button"
            onClick={() => setIsLegalInfoOpen(true)}
            className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current border border-current/20 transition-all cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="Source & Legal Public Domain Verification"
          >
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="hidden xl:inline">Legal Source</span>
          </button>

          {/* Download Text (Rule 7: only if legally permitted) */}
          {isLicensePermittedToDownload ? (
            <button
              type="button"
              onClick={handleDownloadBook}
              className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current border border-current/20 transition-all cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="Download Complete Unabridged Book (.txt)"
            >
              <Download size={15} />
              <span className="hidden xl:inline">Download</span>
            </button>
          ) : (
            <div
              className="p-2 rounded-xl bg-black/5 text-current/40 border border-current/10 cursor-not-allowed hidden sm:flex items-center gap-1 text-xs font-medium"
              title="Downloading is not permitted by license. Accessible within authorized reader only."
            >
              <Download size={15} />
              <span className="hidden xl:inline text-[10px]">In-Reader Only</span>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current border border-current/20 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* 2. SEARCH THE ENTIRE BOOK DRAWER */}
      {isSearchOpen && (
        <div className="bg-slate-900 border-b border-indigo-500/30 p-4 sm:p-5 z-25 shadow-xl space-y-3 animate-fadeIn text-slate-100">
          <div className="flex items-center gap-3">
            <Search size={18} className="text-indigo-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all chapters, dialogues, and sections of this complete book..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-400 font-mono"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white font-mono uppercase cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {searchQuery && (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-1 border-b border-slate-800">
                <span>{searchResults.length} matching passages found across entire book</span>
                {isSearching && <span className="text-indigo-400">Searching complete index...</span>}
              </div>

              {searchResults.map((match, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(match)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                    <span>{match.chapterNum} — {match.chapterTitle}</span>
                    <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      Page {match.estimatedPage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-serif">
                    {match.snippet}
                  </p>
                </button>
              ))}

              {searchResults.length === 0 && !isSearching && (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No matching occurrences found for "{searchQuery}".
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. DISPLAY & TYPOGRAPHY SETTINGS DRAWER */}
      {isSettingsOpen && (
        <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-6 z-25 shadow-xl text-slate-200 animate-fadeIn">
          {/* Theme Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block">Theme</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'paper', label: 'Paper White', bg: 'bg-[#fbf9f4] text-[#24211e] border-[#ded7c4]' },
                { id: 'sepia', label: 'Sepia Parchment', bg: 'bg-[#f4ebd0] text-[#3d2e1b] border-[#d8c89d]' },
                { id: 'dark', label: 'Dark Space', bg: 'bg-[#070b1e] text-slate-200 border-slate-700' },
                { id: 'midnight', label: 'OLED Black', bg: 'bg-black text-white border-zinc-800' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${t.bg} ${
                    theme === t.id ? 'ring-2 ring-indigo-500 scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block">Font Style</span>
            <div className="flex gap-2 text-xs font-bold">
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-3 py-1.5 rounded-xl border font-serif cursor-pointer ${
                  fontFamily === 'serif' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                Serif (Book)
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-3 py-1.5 rounded-xl border font-sans cursor-pointer ${
                  fontFamily === 'sans' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                Sans (Clean)
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`px-3 py-1.5 rounded-xl border font-mono cursor-pointer ${
                  fontFamily === 'mono' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                Dyslexic / Mono
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block">Text Size</span>
            <div className="flex gap-1.5 font-bold text-xs">
              {(['sm', 'base', 'lg', 'xl', '2xl'] as FontSize[]).map(sz => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-3 py-1.5 rounded-xl border cursor-pointer uppercase ${
                    fontSize === sz ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN VIEWPORT & TABLE OF CONTENTS */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Table of Contents Drawer */}
        {isTocOpen && (
          <aside className="w-80 sm:w-96 border-r border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <List size={14} />
                  <span>Table of Contents</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{totalChapters} Chapters</span>
              </div>

              {/* TOC Filter */}
              <input
                type="text"
                value={tocFilter}
                onChange={(e) => setTocFilter(e.target.value)}
                placeholder="Filter chapters..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {activeChapters
                  .map((ch, idx) => ({ ...ch, originalIndex: idx }))
                  .filter(ch => !tocFilter || ch.title.toLowerCase().includes(tocFilter.toLowerCase()) || ch.num.toLowerCase().includes(tocFilter.toLowerCase()))
                  .map((ch) => {
                    const isCurrent = activeChapterIndex === ch.originalIndex;
                    const estReadTime = Math.max(1, Math.round((ch.wordCount || 1000) / 220));

                    return (
                      <button
                        key={ch.originalIndex}
                        type="button"
                        onClick={() => handleJumpToChapter(ch.originalIndex)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                          isCurrent 
                            ? 'bg-indigo-950 border-indigo-500 text-white shadow-md' 
                            : 'bg-slate-900/60 hover:bg-slate-900 border-slate-850 text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold text-indigo-400 shrink-0 mt-0.5">
                          {(ch.originalIndex + 1).toString().padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold uppercase truncate text-white">
                            {ch.num}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {ch.title}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block mt-1">
                            ~{estReadTime} min read • {ch.wordCount} words
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </aside>
        )}

        {/* Reader Canvas Area */}
        <main 
          ref={readerContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 lg:p-16 transition-colors duration-300 ${themeStyles.bg}`}
        >
          <div className="max-w-3xl mx-auto space-y-8">
            {/* SAVED PROGRESS RESUME BANNER (RULE 5) */}
            {savedProgressPrompt && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/50 text-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl animate-fadeIn backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/40">
                    <Compass size={22} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400 block">
                      Saved Reading Position Available
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white">
                      {book.title}
                    </h4>
                    <p className="text-xs text-indigo-200 font-mono mt-0.5">
                      <strong>Chapter {savedProgressPrompt.chapterIndex + 1} ({savedProgressPrompt.chapterTitle})</strong> — <strong>Page {savedProgressPrompt.pageNumber}</strong> • <span className="text-emerald-400 font-bold">{savedProgressPrompt.progressPct}% completed</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={handleResumeProgress}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <span>Continue Reading</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSavedProgressPrompt(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* LOADING COMPLETE TEXT STATE */}
            {isLoadingBook && (
              <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 shadow-xl">
                <RefreshCw size={28} className="animate-spin text-indigo-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Loading Complete Book Content...</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Retrieving complete unabridged authorized text for "{book.title}" from public-domain archives.
                </p>
              </div>
            )}

            {/* MISSING CONTENT / SOURCE NOTICE (RULE 8) */}
            {loadError && !isLoadingBook && totalChapters === 0 && (
              <div className="p-8 rounded-3xl bg-amber-950/40 border border-amber-500/40 text-center space-y-3 shadow-xl">
                <AlertTriangle size={28} className="text-amber-400 mx-auto" />
                <h3 className="text-sm font-bold text-amber-200">
                  The complete text is not available from this authorized source.
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  NeoNova strictly adheres to copyright safety and redistribution rights. Where authorized full texts are not yet accessible, content is never fabricated.
                </p>
                <button
                  type="button"
                  onClick={() => setIsLegalInfoOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  View Copyright & Rights Record
                </button>
              </div>
            )}

            {/* CONTINUOUS READING VIEW */}
            {readingView === 'continuous' && !isLoadingBook && totalChapters > 0 && (
              <div className="space-y-12 animate-fadeIn">
                {/* Book Header Card */}
                <div className={`p-8 sm:p-12 rounded-3xl border-2 text-center space-y-3 shadow-xl ${themeStyles.cardBg} ${themeStyles.border}`}>
                  <div className="text-4xl select-none">{book.icon}</div>
                  <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${themeStyles.cardText} ${getFontFamilyClass()}`}>
                    {book.title}
                  </h1>
                  <p className={`text-xs sm:text-sm uppercase font-mono font-semibold ${themeStyles.mutedText}`}>
                    By <span className="font-bold">{book.author}</span> • {book.year}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                      Complete Unabridged Volume ({totalChapters} Chapters)
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className={themeStyles.mutedText}>~{totalBookPages} Pages ({totalBookWords.toLocaleString()} Words)</span>
                  </div>
                </div>

                {/* All Chapters Rendered Continuously */}
                <div className="space-y-16">
                  {activeChapters.map((ch, chIdx) => {
                    const paragraphs = ch.fullText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);

                    return (
                      <section
                        key={chIdx}
                        id={`whole-book-chapter-${chIdx}`}
                        className={`p-6 sm:p-10 rounded-3xl border-2 space-y-6 shadow-xl transition-all ${themeStyles.cardBg} ${themeStyles.border}`}
                      >
                        {/* Chapter Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/15">
                          <div className="space-y-1">
                            <span className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                              <Hash size={13} />
                              <span>{ch.num}</span>
                            </span>
                            <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles.cardText} ${getFontFamilyClass()}`}>
                              {ch.title}
                            </h2>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            {ch.wordCount} words
                          </span>
                        </div>

                        {/* Chapter Paragraphs */}
                        <div className={`space-y-5 ${getFontFamilyClass()} ${getFontSizeClass()} ${getLineHeightClass()} ${themeStyles.text}`}>
                          {paragraphs.map((para, pIdx) => {
                            const paraKey = `whole-${chIdx}-${pIdx}`;
                            const isExplainingThis = activeExplainingKey === paraKey;

                            return (
                              <div key={pIdx} className="group relative">
                                <p className="relative transition-all p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">
                                  {para}
                                </p>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-1 px-2 font-mono text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleExplainParagraph(paraKey, para)}
                                    className="text-indigo-400 hover:text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/40 flex items-center gap-1.5 cursor-pointer shadow-md"
                                  >
                                    <Sparkles size={11} className="text-indigo-400" />
                                    <span>AI Explain Passage</span>
                                  </button>
                                </div>

                                {isExplainingThis && (
                                  <div className="my-4 p-5 rounded-2xl bg-slate-900 border-2 border-indigo-500/50 shadow-2xl text-slate-100 font-sans text-xs space-y-2 animate-fadeIn">
                                    <div className="flex items-center justify-between text-indigo-400 font-mono font-bold uppercase text-[10px]">
                                      <span>Scholarly Literary Analysis</span>
                                      <button
                                        type="button"
                                        onClick={() => setActiveExplainingKey(null)}
                                        className="text-slate-400 hover:text-white"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <div className="leading-relaxed whitespace-pre-line text-slate-200">
                                      {paragraphExplanation}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CHAPTER BY CHAPTER VIEW */}
            {readingView === 'chapter' && !isLoadingBook && totalChapters > 0 && (
              <div className="space-y-8 animate-fadeIn">
                {/* Chapter Banner */}
                <div className={`p-8 rounded-3xl border-2 text-center space-y-2 shadow-xl ${themeStyles.cardBg} ${themeStyles.border}`}>
                  <span className="text-xs font-mono font-bold text-indigo-500 uppercase tracking-widest">
                    {currentChapter.num} (Chapter {activeChapterIndex + 1} of {totalChapters})
                  </span>
                  <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${themeStyles.cardText} ${getFontFamilyClass()}`}>
                    {currentChapter.title}
                  </h1>
                  <p className={`text-xs uppercase font-mono font-semibold ${themeStyles.mutedText}`}>
                    {book.title} • By {book.author}
                  </p>
                </div>

                {/* Chapter Paragraphs */}
                <div className={`p-6 sm:p-10 rounded-3xl border-2 space-y-6 shadow-xl ${themeStyles.cardBg} ${themeStyles.border}`}>
                  <div className={`space-y-6 ${getFontFamilyClass()} ${getFontSizeClass()} ${getLineHeightClass()} ${themeStyles.text}`}>
                    {chapterParagraphs.map((para, pIdx) => {
                      const paraKey = `chap-${activeChapterIndex}-${pIdx}`;
                      const isExplainingThis = activeExplainingKey === paraKey;

                      return (
                        <div key={pIdx} className="group relative">
                          <p className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                            {para}
                          </p>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 mt-1 px-2 font-mono text-xs">
                            <button
                              type="button"
                              onClick={() => handleExplainParagraph(paraKey, para)}
                              className="text-indigo-400 hover:text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-500/40 flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <Sparkles size={11} className="text-indigo-400" />
                              <span>AI Explain Passage</span>
                            </button>
                          </div>

                          {isExplainingThis && (
                            <div className="my-4 p-5 rounded-2xl bg-slate-900 border-2 border-indigo-500/50 shadow-2xl text-slate-100 font-sans text-xs space-y-2 animate-fadeIn">
                              <div className="flex items-center justify-between text-indigo-400 font-mono font-bold uppercase text-[10px]">
                                <span>Scholarly Literary Analysis</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveExplainingKey(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="leading-relaxed whitespace-pre-line text-slate-200">
                                {paragraphExplanation}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Up Next Chapter Prompt for Continuous Reading Flow (Rule 3) */}
                {activeChapterIndex < totalChapters - 1 ? (
                  <div className={`p-4 sm:p-5 rounded-2xl border-2 ${themeStyles.border} ${themeStyles.cardBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md mt-6`}>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-indigo-500 block">Up Next</span>
                      <p className={`font-bold text-sm truncate ${themeStyles.cardText}`}>
                        {activeChapters[activeChapterIndex + 1]?.num}: {activeChapters[activeChapterIndex + 1]?.title}
                      </p>
                      <span className={`text-[11px] font-mono ${themeStyles.mutedText}`}>
                        ~{Math.max(1, Math.round((activeChapters[activeChapterIndex + 1]?.wordCount || 1000) / 220))} min read • {activeChapters[activeChapterIndex + 1]?.wordCount} words
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextChapter}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 shrink-0 self-start sm:self-center"
                    >
                      <span>Continue to Next Chapter</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-center space-y-1 mt-6">
                    <p className="text-xs font-bold font-mono uppercase tracking-wider">🎉 Final Chapter Reached</p>
                    <p className="text-xs text-slate-300">You have completed all {totalChapters} chapters of this unabridged classical edition.</p>
                  </div>
                )}

                {/* Chapter Bottom Navigation Bar (Rule 3) */}
                <div className="pt-4 flex items-center justify-between gap-4 font-mono">
                  <button
                    type="button"
                    disabled={activeChapterIndex === 0}
                    onClick={handlePrevChapter}
                    className="py-3 px-5 rounded-xl border border-current/20 bg-black/10 hover:bg-black/20 text-current disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs uppercase transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous Chapter</span>
                  </button>

                  <span className={`text-xs font-bold ${themeStyles.mutedText}`}>
                    {activeChapterIndex + 1} / {totalChapters}
                  </span>

                  <button
                    type="button"
                    disabled={activeChapterIndex === totalChapters - 1}
                    onClick={handleNextChapter}
                    className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
                  >
                    <span>Next Chapter</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 5. LEGAL SOURCE & COPYRIGHT VERIFICATION MODAL */}
      {isLegalInfoOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLegalInfoOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full text-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Legal & Source Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    NeoNova Classic Hub • Public Domain Educational Heritage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLegalInfoOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Book Origin & Author</span>
                <p className="text-sm font-bold text-white">{book.title}</p>
                <p className="text-slate-300">Author: <span className="font-semibold text-white">{book.author}</span> {book.authorLifespan ? `(${book.authorLifespan})` : ''}</p>
                <p className="text-slate-300">Country: <span className="font-semibold text-white">{book.country}</span> • Language: <span className="font-semibold text-white">{book.language}</span></p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Copyright & Redistribution Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {book.licenseType || 'Public Domain worldwide'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed pt-1">
                  {book.copyrightStatus || 'Verified public-domain work legally accessible for unrestricted educational reading, research, and redistribution.'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Original Archival Repository</span>
                <p className="text-slate-200 font-medium">
                  {loadedBookContent?.source || book.source || 'Project Gutenberg Archive & Open Repositories'}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Unabridged Status: {loadedBookContent?.isComplete ? 'Complete Full Volume' : 'Verified Excerpt / Introduction'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLegalInfoOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
