import { useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'fi';

export interface Translations {
  // Navigation & Header
  home: string;
  subjects: string;
  homework: string;
  stages: string;
  threeDLab: string;
  tools: string;
  progress: string;
  settings: string;
  allFeatures: string;
  voiceAi: string;
  scan: string;
  upgrade: string;
  searchPlaceholder: string;

  // Language names
  english: string;
  finnish: string;

  // Common Actions
  back: string;
  save: string;
  cancel: string;
  loading: string;
  close: string;
  verify: string;
  startLearning: string;
  switchLanguage: string;

  // Payment & Checkout
  checkoutTitle: string;
  selectPayment: string;
  razorpayCheckout: string;
  razorpaySub: string;
  instantUpi: string;
  upiSub: string;
  totalPayable: string;
  payWithRazorpay: string;
  sslSecured: string;
  selectedPlan: string;
  monthly: string;
  annual: string;
  saveDiscount: string;
  studentAccount: string;
  subscriptionPlan: string;
  instantActivation: string;

  // Education & Study
  grade: string;
  academicXp: string;
  askHomework: string;
  stepByStep: string;
  helpUnderstand: string;
  tutorGreeting: string;
  practiceQuiz: string;
  dailyChallenge: string;
  memoryBooster: string;
  notesSummary: string;
}

const translations: Record<SupportedLanguage, Translations> = {
  en: {
    // Navigation & Header
    home: 'Home',
    subjects: 'Subjects',
    homework: 'Homework',
    stages: '4-Stage Testing',
    threeDLab: '3D Anatomy Lab',
    tools: 'Study Tools',
    progress: 'Progress',
    settings: 'Settings',
    allFeatures: 'All Features',
    voiceAi: 'Voice AI',
    scan: 'Scan',
    upgrade: 'Upgrade to Pro',
    searchPlaceholder: 'Search subjects, topics, or formulas...',

    // Language names
    english: 'English',
    finnish: 'Suomi (Finnish)',

    // Common Actions
    back: 'Back',
    save: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading...',
    close: 'Close',
    verify: 'Verify & Activate',
    startLearning: 'Start Learning Now',
    switchLanguage: 'Language / Kieli',

    // Payment & Checkout
    checkoutTitle: 'NeoNova Official Payment Gateway',
    selectPayment: 'Select Payment Method:',
    razorpayCheckout: 'Razorpay Standard Checkout',
    razorpaySub: 'Cards, 50+ NetBanking, Wallets, UPI',
    instantUpi: 'Instant UPI QR',
    upiSub: 'PhonePe, GPay, Paytm, BHIM',
    totalPayable: 'Total Payable',
    payWithRazorpay: 'Pay with Razorpay Standard Checkout',
    sslSecured: '🔒 256-Bit SSL Encrypted. Powered by Razorpay Standard Web Checkout. Your payment details are protected by bank-grade security.',
    selectedPlan: 'Selected Plan',
    monthly: 'Monthly',
    annual: 'Annual',
    saveDiscount: 'Save 25%',
    studentAccount: 'Student Account:',
    subscriptionPlan: 'Subscription Plan:',
    instantActivation: 'Instant (< 3s) on Payment Success',

    // Education & Study
    grade: 'Grade',
    academicXp: 'Academic XP',
    askHomework: 'Ask any homework question, upload a worksheet, or test your skills...',
    stepByStep: 'Detailed Step-by-Step Reasoning',
    helpUnderstand: 'Help Me Understand (Everyday Analogy)',
    tutorGreeting: "Hello! I'm NeoNova AI Tutor, your homework coach and study partner.",
    practiceQuiz: 'Practice Quiz',
    dailyChallenge: 'Daily Challenge',
    memoryBooster: 'Memory Booster',
    notesSummary: 'Notes & Summary'
  },
  fi: {
    // Navigation & Header (Suomi)
    home: 'Etusivu',
    subjects: 'Oppiaineet',
    homework: 'Kotitehtävät',
    stages: '4-vaiheinen testaus',
    threeDLab: '3D-anatomian laboratorio',
    tools: 'Opiskelutyökalut',
    progress: 'Edistyminen',
    settings: 'Asetukset',
    allFeatures: 'Kaikki toiminnot',
    voiceAi: 'Ääni-tekoäly',
    scan: 'Skannaa',
    upgrade: 'Päivitä Pro-tasolle',
    searchPlaceholder: 'Hae oppiaineita, aiheita tai kaavoja...',

    // Language names
    english: 'English (Englanti)',
    finnish: 'Suomi (Finnish)',

    // Common Actions
    back: 'Takaisin',
    save: 'Tallenna muutokset',
    cancel: 'Peruuta',
    loading: 'Ladataan...',
    close: 'Sulje',
    verify: 'Vahvista ja aktivoi',
    startLearning: 'Aloita opiskelu nyt',
    switchLanguage: 'Kieli / Language',

    // Payment & Checkout
    checkoutTitle: 'NeoNovan virallinen maksupalvelu',
    selectPayment: 'Valitse maksutapa:',
    razorpayCheckout: 'Razorpay-kassapalvelu',
    razorpaySub: 'Kortit, 50+ verkkopankkia, lompakot, UPI',
    instantUpi: 'Välitön UPI QR -maksu',
    upiSub: 'PhonePe, GPay, Paytm, BHIM',
    totalPayable: 'Maksettava summa',
    payWithRazorpay: 'Maksa Razorpay-kassapalvelulla',
    sslSecured: '🔒 256-bittinen SSL-salaus. Suojattu Razorpay-kassapalvelulla. Maksutietosi on suojattu pankkitasoisella tietoturvalla.',
    selectedPlan: 'Valittu tilaus',
    monthly: 'Kuukausittain',
    annual: 'Vuosittain',
    saveDiscount: 'Säästä 25%',
    studentAccount: 'Oppilastili:',
    subscriptionPlan: 'Tilauspaketti:',
    instantActivation: 'Välitön aktivointi (< 3s) maksun onnistuttua',

    // Education & Study
    grade: 'Luokka-aste',
    academicXp: 'Opiskelu-XP',
    askHomework: 'Kysy mitä tahansa kotitehtävästä, lataa tehtävämoniste tai testaa taitojasi...',
    stepByStep: 'Yksityiskohtainen vaiheittainen perustelu',
    helpUnderstand: 'Auta minua ymmärtämään (arkinen vertauskuva)',
    tutorGreeting: 'Hei! Olen NeoNova-tekoälytuutorisi, kotitehtävävalmentajasi ja opiskelukumppanisi.',
    practiceQuiz: 'Harjoitusvisa',
    dailyChallenge: 'Päivittäinen haaste',
    memoryBooster: 'Muistitehostin',
    notesSummary: 'Muistiinpanot ja tiivistelmä'
  }
};

const LANGUAGE_STORAGE_KEY = 'neonova_app_language';
const LANGUAGE_EVENT = 'neonova_language_change';

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'fi' || saved === 'en') return saved;
  return 'en';
}

export function setAppLanguage(lang: SupportedLanguage) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: lang }));
  }
}

export function useTranslation() {
  const [lang, setLang] = useState<SupportedLanguage>(getStoredLanguage);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLanguage>;
      if (customEvent.detail && (customEvent.detail === 'en' || customEvent.detail === 'fi')) {
        setLang(customEvent.detail);
      } else {
        setLang(getStoredLanguage());
      }
    };

    window.addEventListener(LANGUAGE_EVENT, handleLangChange);
    return () => window.removeEventListener(LANGUAGE_EVENT, handleLangChange);
  }, []);

  const changeLanguage = (newLang: SupportedLanguage) => {
    setAppLanguage(newLang);
    setLang(newLang);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'fi' : 'en';
    changeLanguage(nextLang);
  };

  return {
    lang,
    t: translations[lang],
    setLanguage: changeLanguage,
    toggleLanguage,
    isFinnish: lang === 'fi'
  };
}
