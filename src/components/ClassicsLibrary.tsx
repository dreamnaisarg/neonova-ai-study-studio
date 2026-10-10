import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Search, Filter, Sparkles, Bookmark, FileText, 
  ChevronLeft, ChevronRight, HelpCircle, GraduationCap, Clock, Award,
  Volume2, Eye, ShieldCheck, Download, Check, Info, X, Globe,
  ArrowRight, BookMarked, Layers, Compass, Library, Star, Share2,
  RefreshCw, CheckCircle2, SlidersHorizontal, BookCheck, Flame
} from 'lucide-react';
import { 
  GLOBAL_CLASSIC_BOOKS, 
  ClassicBook, 
  Region 
} from '../utils/classicsCatalog';
import FullBookReaderModal from './FullBookReaderModal';

interface ClassicsLibraryProps {
  onImportClassicBook?: (
    title: string,
    author: string,
    icon?: string,
    paragraphs?: any[],
    themes?: string[],
    attribution?: string
  ) => void;
  adjustXP?: (amount: number) => void;
  currentGrade?: string;
}

const REGIONS: { id: string; label: string; flag: string }[] = [
  { id: 'All', label: 'All Regions', flag: '🌐' },
  { id: 'Asia', label: 'Asia (India, China, Japan)', flag: '🌏' },
  { id: 'Europe', label: 'Europe (UK, France, Greece)', flag: '🌍' },
  { id: 'Americas', label: 'Americas (US, Maya, Mexico)', flag: '🌎' },
  { id: 'Africa', label: 'Africa (Egypt, Ghana, Nigeria)', flag: '🌍' },
  { id: 'Middle East', label: 'Middle East (Persia, Mesopotamia)', flag: '🕌' },
  { id: 'Oceania', label: 'Oceania (Australia, New Zealand)', flag: '🌊' }
];

const CATEGORIES = [
  'All',
  "Children's Books",
  'Ancient Texts',
  'Poetry',
  'Classics',
  'Science',
  'Philosophy',
  'History',
  'Mystery',
  'Fantasy',
  'World Literature',
  'Science Fiction',
  'Educational'
];

const LANGUAGES = [
  'All',
  'English',
  'Sanskrit & English',
  'Bengali & English',
  'Gujarati & English',
  'Tamil & English',
  'Chinese & English',
  'Japanese & English',
  'Persian & English',
  'Arabic & English',
  'Ancient Egyptian & English',
  'Ancient Greek & English',
  'Latin & English',
  'French & English',
  'Spanish & English',
  'Russian & English'
];

const GRADE_LEVELS = [
  'All',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12'
];

export default function ClassicsLibrary({
  onImportClassicBook,
  adjustXP,
  currentGrade = 'Grade 8'
}: ClassicsLibraryProps) {
  const allBooks = useMemo(() => GLOBAL_CLASSIC_BOOKS, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedLength, setSelectedLength] = useState('All');
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // View & Presentation State
  const [viewMode, setViewMode] = useState<'shelf' | 'catalog' | 'table'>('shelf');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<ClassicBook | null>(allBooks[0]);
  const [animatingBookId, setAnimatingBookId] = useState<string | null>(null);

  // Modals & Storage
  const [isFullBookReaderOpen, setIsFullBookReaderOpen] = useState(false);
  const [infoModalBook, setInfoModalBook] = useState<ClassicBook | null>(null);
  const [recentBookIds, setRecentBookIds] = useState<string[]>([]);
  const [offlineBookIds, setOfflineBookIds] = useState<string[]>([]);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

  const booksPerPage = viewMode === 'table' ? 20 : 12;

  // Initialize recent and offline books from localStorage
  useEffect(() => {
    try {
      const recents = JSON.parse(localStorage.getItem('neonova_classic_recent_books') || '[]');
      if (Array.isArray(recents)) {
        setRecentBookIds(recents);
      }
    } catch {}

    try {
      const offlineIds: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('neonova_offline_book_')) {
          offlineIds.push(key.replace('neonova_offline_book_', ''));
        }
      }
      setOfflineBookIds(offlineIds);
    } catch {}
  }, []);

  const handleBookSelection = (book: ClassicBook, directReader = true) => {
    setAnimatingBookId(book.id);
    setSelectedBook(book);

    // Update Recents
    try {
      const updatedRecents = [book.id, ...recentBookIds.filter(id => id !== book.id)].slice(0, 8);
      setRecentBookIds(updatedRecents);
      localStorage.setItem('neonova_classic_recent_books', JSON.stringify(updatedRecents));
    } catch {}

    if (directReader) {
      setTimeout(() => {
        setIsFullBookReaderOpen(true);
        setAnimatingBookId(null);
      }, 180);
    } else {
      setTimeout(() => {
        setAnimatingBookId(null);
      }, 350);
    }
  };

  const handleToggleOffline = (e: React.MouseEvent, book: ClassicBook) => {
    e.stopPropagation();
    const key = `neonova_offline_book_${book.id}`;
    if (offlineBookIds.includes(book.id)) {
      localStorage.removeItem(key);
      setOfflineBookIds(prev => prev.filter(id => id !== book.id));
    } else {
      localStorage.setItem(key, JSON.stringify({
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year,
        category: book.category,
        cachedAt: new Date().toISOString()
      }));
      setOfflineBookIds(prev => [...prev, book.id]);
    }
  };

  const handleImportToNotebook = (e: React.MouseEvent, book: ClassicBook) => {
    e.stopPropagation();
    if (onImportClassicBook) {
      onImportClassicBook(
        book.title,
        book.author,
        book.icon,
        book.chapters,
        book.themes,
        `${book.source} • Verified Public Domain`
      );
    }
    if (adjustXP) {
      adjustXP(45);
    }
  };

  const handleShareCitation = (e: React.MouseEvent, book: ClassicBook) => {
    e.stopPropagation();
    const citation = `"${book.title}" by ${book.author} (${book.year}) [${book.licenseType}]. NeoNova Classic Hub. Source: ${book.source}`;
    navigator.clipboard.writeText(citation);
    setCopySuccessId(book.id);
    setTimeout(() => setCopySuccessId(null), 2000);
  };

  // Filter Pipeline
  const filteredBooks = useMemo(() => {
    return allBooks.filter(book => {
      // 1. Text Search (title, author, language, country, category, themes, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = book.title.toLowerCase().includes(q) || (book.originalTitle && book.originalTitle.toLowerCase().includes(q));
        const matchesAuthor = book.author.toLowerCase().includes(q);
        const matchesCountry = book.country.toLowerCase().includes(q);
        const matchesLanguage = book.language.toLowerCase().includes(q);
        const matchesCategory = book.category.toLowerCase().includes(q);
        const matchesThemes = book.themes.some(t => t.toLowerCase().includes(q));
        const matchesDesc = book.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesCountry && !matchesLanguage && !matchesCategory && !matchesThemes && !matchesDesc) {
          return false;
        }
      }

      // 2. Region Filter
      if (selectedRegion !== 'All' && book.region !== selectedRegion) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All' && book.category !== selectedCategory) {
        return false;
      }

      // 4. Language Filter
      if (selectedLanguage !== 'All' && !book.language.includes(selectedLanguage.split('&')[0].trim())) {
        return false;
      }

      // 5. Grade Filter
      if (selectedGrade !== 'All') {
        if (!book.recommendedGrades.includes(selectedGrade)) {
          return false;
        }
      }

      // 6. Difficulty Filter
      if (selectedDifficulty !== 'All' && book.difficulty !== selectedDifficulty) {
        return false;
      }

      // 7. Reading Length
      if (selectedLength !== 'All') {
        const isQuick = book.estimatedReadTime.includes('min') || book.estimatedReadTime.includes('1 hour') || book.estimatedReadTime.includes('1.5 hour');
        const isMedium = book.estimatedReadTime.includes('2 hour') || book.estimatedReadTime.includes('2.5 hour') || book.estimatedReadTime.includes('3 hour') || book.estimatedReadTime.includes('3.5 hour') || book.estimatedReadTime.includes('4 hour');
        if (selectedLength === 'Quick' && !isQuick) return false;
        if (selectedLength === 'Medium' && !isMedium) return false;
        if (selectedLength === 'In-Depth' && (isQuick || isMedium)) return false;
      }

      // 8. Offline Only
      if (showOfflineOnly && !offlineBookIds.includes(book.id)) {
        return false;
      }

      return true;
    });
  }, [allBooks, searchQuery, selectedRegion, selectedCategory, selectedLanguage, selectedGrade, selectedDifficulty, selectedLength, showOfflineOnly, offlineBookIds]);

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * booksPerPage;
    return filteredBooks.slice(start, start + booksPerPage);
  }, [filteredBooks, currentPage, booksPerPage]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Curated Sub-Collections
  const recentBooks = useMemo(() => {
    return recentBookIds
      .map(id => allBooks.find(b => b.id === id))
      .filter((b): b is ClassicBook => Boolean(b));
  }, [recentBookIds, allBooks]);

  const recommendedForCurrentGrade = useMemo(() => {
    return allBooks.filter(b => b.recommendedGrades.includes(currentGrade)).slice(0, 6);
  }, [allBooks, currentGrade]);

  const worldLiteratureHighlights = useMemo(() => {
    return allBooks.filter(b => b.isWorldLiterature).slice(0, 6);
  }, [allBooks]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All');
    setSelectedCategory('All');
    setSelectedLanguage('All');
    setSelectedGrade('All');
    setSelectedDifficulty('All');
    setSelectedLength('All');
    setShowOfflineOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-7 font-sans text-slate-800 pb-16">
      {/* 1. GRAND LIBRARY ENTRANCE & HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 md:p-10 border border-indigo-900/60 shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 opacity-10 select-none text-[160px] leading-none font-serif font-black pointer-events-none">
          📖
        </div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Library size={13} className="text-indigo-400" />
              <span>NeoNova Classic Hub</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck size={12} />
              <span>Verified Public Domain & Open Access</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Created by: <span className="font-semibold text-slate-200">Naisarg Ramdatti</span>
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-serif">
              NeoNova Classic Hub
            </h1>
            <p className="text-sm sm:text-base text-indigo-200/90 font-medium mt-1">
              A global library for learning, reading, and discovery
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
              Explore unabridged literature, ancient treatises, moral fables, and scientific foundations from India, China, Greece, Persia, Egypt, Ghana, Europe, the Americas, and Oceania. All legally preserved and formatted for modern student learning.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-bold text-white font-mono">{allBooks.length}</div>
              <div className="text-[11px] text-slate-400">Public Domain Works</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-bold text-indigo-300 font-mono">6 Continents</div>
              <div className="text-[11px] text-slate-400">Global Regions</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-bold text-emerald-300 font-mono">18+ Languages</div>
              <div className="text-[11px] text-slate-400">Original & Translated</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-lg sm:text-xl font-bold text-amber-300 font-mono">Grade {currentGrade.replace(/\D/g, '') || '8'}</div>
              <div className="text-[11px] text-slate-400">Tailored Curriculum</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RECENTLY OPENED / CONTINUE READING SHELF */}
      {recentBooks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              <span>Continue Reading / Recently Opened</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              {recentBooks.length} in your recent reading log
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookSelection(book, true)}
                className="group relative p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className={`w-full aspect-3/4 rounded-xl bg-gradient-to-br ${book.coverGradient} p-2 text-white flex flex-col justify-between relative shadow-xs overflow-hidden mb-2 group-hover:scale-[1.02] transition-transform`}>
                    <div className="flex justify-between items-start text-xs">
                      <span>{book.icon}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-xs">{book.country}</span>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold font-serif leading-tight line-clamp-2">{book.title}</h4>
                      <p className="text-[9px] text-white/80 truncate mt-0.5">{book.author}</p>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{book.author}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>Resume →</span>
                  <span className="text-[9px] font-normal text-slate-400">{book.estimatedReadTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SEARCH & DYNAMIC FILTER BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title, author, language (e.g. Gujarati, Sanskrit), country, subject, or keywords..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Action Toggles */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('shelf')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'shelf'
                    ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Wooden Bookshelf View"
              >
                <Layers size={13} />
                <span className="hidden sm:inline">Bookshelves</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('catalog')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'catalog'
                    ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Curated Catalog Cards"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">Catalog</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Scholar's Table View"
              >
                <FileText size={13} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Offline Filter Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowOfflineOnly(!showOfflineOnly);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showOfflineOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Filter to offline saved volumes"
            >
              <Bookmark size={13} className={showOfflineOnly ? 'fill-current' : ''} />
              <span>Offline ({offlineBookIds.length})</span>
            </button>

            {/* Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                showFiltersDrawer
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* REGION PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {REGIONS.map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => {
                  setSelectedRegion(reg.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{reg.flag}</span>
                <span>{reg.label}</span>
              </button>
            );
          })}
        </div>

        {/* EXPANDABLE MULTI-FILTER DRAWER */}
        {showFiltersDrawer && (
          <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-150">
            {/* Category Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Grade Level Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Grade Suitability
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {GRADE_LEVELS.map(gr => (
                  <option key={gr} value={gr}>{gr === 'All' ? 'All Grades' : gr}</option>
                ))}
              </select>
            </div>

            {/* Reading Length */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                Reading Length
              </label>
              <select
                value={selectedLength}
                onChange={(e) => {
                  setSelectedLength(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Lengths</option>
                <option value="Quick">Quick (&lt; 1 hr)</option>
                <option value="Medium">Medium (1–4 hrs)</option>
                <option value="In-Depth">In-Depth (4+ hrs)</option>
              </select>
            </div>

            {/* Active Filters Reset */}
            <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                Found <strong className="text-slate-900">{filteredBooks.length}</strong> matching volumes
              </span>
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. CURATED HIGHLIGHTS: RECOMMENDED FOR YOUR GRADE (When not actively filtering) */}
      {!searchQuery && selectedRegion === 'All' && selectedCategory === 'All' && currentPage === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Recommended for {currentGrade}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Curriculum Aligned
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedGrade(currentGrade)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All {currentGrade} Books →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recommendedForCurrentGrade.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookSelection(book)}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex gap-3.5 items-start group"
              >
                <div className={`w-16 h-24 rounded-xl bg-gradient-to-br ${book.coverGradient} p-2 text-white flex flex-col justify-between shrink-0 shadow-xs relative overflow-hidden group-hover:scale-105 transition-transform`}>
                  <span className="text-base">{book.icon}</span>
                  <span className="text-[9px] font-bold font-serif line-clamp-2 leading-tight">{book.title}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {book.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">• {book.country}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {book.author}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                    {book.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookSelection(book, true);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                    >
                      <span>Read Online</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInfoModalBook(book);
                      }}
                      className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-0.5"
                    >
                      <Info size={12} />
                      <span>Source</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. MAIN BOOK PRESENTATION (BOOKSHELVES, CATALOG GRID, OR TABLE) */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {selectedRegion === 'All' ? 'Global Classical Library' : `${selectedRegion} Volumes`}
            </h2>
            <span className="text-xs text-slate-500">
              ({filteredBooks.length} available)
            </span>
          </div>
          {totalPages > 1 && (
            <span className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>

        {/* EMPTY STATE */}
        {filteredBooks.length === 0 && (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-sm font-bold text-slate-900">No classical volumes found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No public-domain titles matched your current search and filter settings. Try clearing some filters or searching by a broader keyword.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* 5A. VIEW MODE 1: 🪵 REALISTIC BOOKSHELVES VIEW */}
        {viewMode === 'shelf' && filteredBooks.length > 0 && (
          <div className="space-y-8">
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                {paginatedBooks.map((book) => {
                  const isSelected = selectedBook?.id === book.id;
                  const isAnimating = animatingBookId === book.id;
                  const isOffline = offlineBookIds.includes(book.id);

                  return (
                    <div 
                      key={book.id}
                      onClick={() => handleBookSelection(book)}
                      className="group flex flex-col items-center cursor-pointer select-none relative"
                    >
                      {/* Realistic Standing Book Container */}
                      <div className="relative w-full aspect-3/4 flex items-end justify-center perspective-500">
                        {/* 3D Book Cover Card */}
                        <div
                          className={`w-[90%] h-[95%] rounded-r-xl rounded-l-xs p-3 text-white flex flex-col justify-between relative shadow-lg transition-all duration-300 bg-gradient-to-br ${book.coverGradient} border-l-4 border-l-black/40 border-r border-t border-b border-white/20 ${
                            isAnimating
                              ? 'scale-110 -translate-y-4 shadow-2xl ring-4 ring-indigo-400 z-30'
                              : isSelected
                              ? 'scale-105 -translate-y-2 ring-2 ring-indigo-400/80 z-20'
                              : 'group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-2xl z-10'
                          }`}
                        >
                          {/* Book Header Badges */}
                          <div className="flex justify-between items-start">
                            <span className="text-xl filter drop-shadow-xs">{book.icon}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-xs border border-white/10 uppercase">
                              {book.languageCode}
                            </span>
                          </div>

                          {/* Book Title & Author */}
                          <div className="space-y-1">
                            <h3 className="text-xs sm:text-sm font-bold font-serif leading-tight line-clamp-3 text-white filter drop-shadow-sm">
                              {book.title}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-white/80 font-medium truncate">
                              {book.author}
                            </p>
                          </div>

                          {/* Book Footer Chips */}
                          <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/20 text-white/90">
                            <span className="truncate">{book.year}</span>
                            <span className="font-bold">{book.estimatedReadTime}</span>
                          </div>

                          {/* Offline Ribbon */}
                          {isOffline && (
                            <div className="absolute -top-1.5 right-2 w-3.5 h-6 bg-emerald-500 rounded-b-sm shadow-md flex items-center justify-center text-[8px] text-white font-bold">
                              ⚡
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Wooden Shelf Plank Ledge */}
                      <div className="w-full h-3 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 rounded-xs shadow-md border-t border-amber-600/40 border-b border-black mt-1 relative">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40" />
                      </div>

                      {/* Book Label Beneath Shelf */}
                      <div className="w-full text-center mt-2 px-1">
                        <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {book.country} • {book.category}
                        </p>
                      </div>

                      {/* Hover Action Bar */}
                      <div className="mt-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookSelection(book, true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-xs cursor-pointer"
                        >
                          Read
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInfoModalBook(book);
                          }}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                          title="View Source & Copyright Status"
                        >
                          <Info size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleOffline(e, book)}
                          className={`p-1 rounded-lg transition-colors cursor-pointer ${
                            isOffline ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title={isOffline ? 'Saved for Offline Reading' : 'Save for Offline'}
                        >
                          <Bookmark size={13} className={isOffline ? 'fill-current' : ''} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5B. VIEW MODE 2: 📑 CURATED CATALOG GRID */}
        {viewMode === 'catalog' && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedBooks.map((book) => {
              const isSelected = selectedBook?.id === book.id;
              const isOffline = offlineBookIds.includes(book.id);

              return (
                <div
                  key={book.id}
                  onClick={() => handleBookSelection(book)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400/80 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header Card Row */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl filter drop-shadow-xs select-none">{book.icon}</span>
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            <span>{book.country}</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {book.year}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {book.author} {book.authorLifespan ? `(${book.authorLifespan})` : ''}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 my-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {book.language}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {book.category}
                      </span>
                      {isOffline && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Check size={10} />
                          <span>Offline</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                      {book.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookSelection(book, true);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Read Online</span>
                      <ArrowRight size={13} />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInfoModalBook(book);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        title="Source & Legal Public Domain Info"
                      >
                        <Info size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleToggleOffline(e, book)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isOffline ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={isOffline ? 'Remove from offline cache' : 'Save for offline'}
                      >
                        <Bookmark size={14} className={isOffline ? 'fill-current' : ''} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleImportToNotebook(e, book)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                        title="Import to AI Homework Notebook"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5C. VIEW MODE 3: 📜 SCHOLAR'S RESEARCH TABLE */}
        {viewMode === 'table' && filteredBooks.length > 0 && (
          <div className="overflow-x-auto bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-3">Author</th>
                  <th className="py-3 px-3">Country / Region</th>
                  <th className="py-3 px-3">Language</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Read Time</th>
                  <th className="py-3 px-3">License / Rights</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBooks.map((book) => {
                  const isOffline = offlineBookIds.includes(book.id);
                  return (
                    <tr 
                      key={book.id} 
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                      onClick={() => handleBookSelection(book, true)}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-base">{book.icon}</span>
                        <div>
                          <div className="font-semibold text-slate-900 line-clamp-1">{book.title}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{book.year}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {book.author}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {book.country}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">
                          {book.language}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {book.category}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {book.estimatedReadTime}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[10px]">
                          <ShieldCheck size={11} />
                          <span>Public Domain</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleBookSelection(book, true)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Read
                          </button>
                          <button
                            type="button"
                            onClick={() => setInfoModalBook(book)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                            title="Legal Source Info"
                          >
                            <Info size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleOffline(e, book)}
                            className={`p-1 rounded-lg cursor-pointer ${
                              isOffline ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={isOffline ? 'Saved Offline' : 'Save for Offline'}
                          >
                            <Bookmark size={14} className={isOffline ? 'fill-current' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
            <span>
              Showing {((currentPage - 1) * booksPerPage) + 1}–{Math.min(currentPage * booksPerPage, filteredBooks.length)} of {filteredBooks.length} classical volumes
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Previous
              </button>
              <div className="px-2 font-mono font-bold text-slate-700">
                {currentPage} / {totalPages}
              </div>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. BOOK INFORMATION & LEGAL SOURCE MODAL */}
      {infoModalBook && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInfoModalBook(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none">{infoModalBook.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {infoModalBook.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    By <span className="font-semibold">{infoModalBook.author}</span> {infoModalBook.authorLifespan ? `(${infoModalBook.authorLifespan})` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInfoModalBook(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Copyright & Public Domain Verification</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {infoModalBook.licenseType}
                  </span>
                </div>
                <p className="text-emerald-950 font-medium leading-relaxed pt-1">
                  {infoModalBook.copyrightStatus}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Country & Region</span>
                  <p className="font-semibold text-slate-800">{infoModalBook.country} ({infoModalBook.region})</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Original Language</span>
                  <p className="font-semibold text-slate-800">{infoModalBook.language}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Historical Period</span>
                  <p className="font-semibold text-slate-800">{infoModalBook.period || 'Classical'} • {infoModalBook.year}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Length</span>
                  <p className="font-semibold text-slate-800">{infoModalBook.estimatedReadTime} (~{infoModalBook.wordCount.toLocaleString()} words)</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Source & Digital Heritage</span>
                <p className="text-slate-700 font-medium">
                  {infoModalBook.source}
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Format: {infoModalBook.readingFormat}. Unabridged public domain text verified for student academic study and literary exploration.
                </p>
              </div>

              {infoModalBook.funFact && (
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Literary Fun Fact</span>
                  <p className="text-slate-700 italic">
                    "{infoModalBook.funFact}"
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => handleShareCitation(e, infoModalBook)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copySuccessId === infoModalBook.id ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copySuccessId === infoModalBook.id ? 'Citation Copied!' : 'Copy Citation'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInfoModalBook(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = infoModalBook;
                    setInfoModalBook(null);
                    handleBookSelection(target, true);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Open in Reader</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FULL BOOK INTERACTIVE READER MODAL */}
      <FullBookReaderModal
        book={selectedBook}
        isOpen={isFullBookReaderOpen}
        onClose={() => setIsFullBookReaderOpen(false)}
        onImportBook={(book) => {
          if (onImportClassicBook) {
            onImportClassicBook(
              book.title,
              book.author,
              book.icon,
              book.chapters,
              book.themes,
              `${book.source} • Verified Public Domain`
            );
          }
        }}
        adjustXP={adjustXP}
        initialView="continuous"
      />
    </div>
  );
}
