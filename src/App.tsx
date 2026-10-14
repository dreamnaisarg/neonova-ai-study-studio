import React, { useState, useEffect, useRef } from 'react';
import { 
  EduTab, 
  default as EduSidebar 
} from './components/education/EduSidebar';
import EduHeader from './components/education/EduHeader';
import EduMobileNav from './components/education/EduMobileNav';
import HomePage from './components/education/HomePage';
import SubjectsPage from './components/education/SubjectsPage';
import StageSystemMain from './components/stages/StageSystemMain';
import Mission7EventHub from './components/missions/Mission7EventHub';
import HomeworkHelperView from './components/education/HomeworkHelperView';
import NeoNovaAITutorTab from './components/scifi/NeoNovaAITutorTab';
import StudyToolsPage from './components/education/StudyToolsPage';
import ClassicsLibrary from './components/ClassicsLibrary';
import ProgressTracker from './components/ProgressTracker';
import SettingsPage from './components/education/SettingsPage';
import PlansPage from './components/education/PlansPage';
import ProfileView from './components/education/ProfileView';
import PracticeQuiz from './components/scifi/PracticeQuiz';
import DailyHub from './components/DailyHub';
import MemoryBooster from './components/MemoryBooster';
import NotesSummarizer from './components/scifi/NotesSummarizer';
import FutureCareerMatch from './components/FutureCareerMatch';
import FormulaRoom from './components/scifi/FormulaRoom';
import NeoVisionHub from './components/education/NeoVisionHub';
import DrawingCanvas from './components/DrawingCanvas';
import OpticHomeworkScanner from './components/scifi/OpticHomeworkScanner';
import HelpMeUnderstandModal from './components/HelpMeUnderstandModal';
import GlobalSearchModal from './components/education/GlobalSearchModal';
import UserProfileModal from './components/scifi/UserProfileModal';
import TrustFooterModal from './components/scifi/TrustFooterModal';
import SplashScreen from './components/scifi/SplashScreen';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import DeleteAccountPage from './components/DeleteAccountPage';
import PremiumLockModal from './components/education/PremiumLockModal';
import PaymentCheckoutModal from './components/education/PaymentCheckoutModal';
import MobileDrawerNav from './components/education/MobileDrawerNav';
import AccessibilityHelpModal from './components/education/AccessibilityHelpModal';
import AdminPaymentPortalModal from './components/education/AdminPaymentPortalModal';
import NeoNovaAuthScreen, { AuthenticatedUser } from './components/auth/NeoNovaAuthScreen';
import AIHomeworkSolverView from './components/homework/AIHomeworkSolverView';
import AdaptivePracticeView from './components/education/AdaptivePracticeView';
import MistakesDashboard from './components/education/MistakesDashboard';
import RealtimeVoiceModal from './components/voice/RealtimeVoiceModal';
import ThreeDModelGenerator from './components/education/ThreeDModelGenerator';
import StudyAlertsPage from './components/education/StudyAlertsPage';
import { stripAllSymbolsForPlaintext } from './utils';

import { 
  Notebook, 
  Message, 
  SUBJECTS, 
  GRADES 
} from './types';
import { 
  PlanTier, 
  getCurrentSubscriptionState, 
  VerifiedSubscriptionState, 
  saveLocalSubscription,
  saveActiveSubscriptionPlan
} from './lib/billing';
import { 
  addCompletedAssignment, 
  getAcademicXP, 
  addAcademicXP 
} from './lib/progressStorage';

const NOTEBOOKS_KEY = 'neonova_student_notebooks_v3';
const PROFILE_KEY = 'neonova_student_profile_v2';
const DARK_MODE_KEY = 'neonova_dark_mode';

const INITIAL_NOTEBOOK: Notebook = {
  id: 'default-notebook-1',
  title: 'Mathematics Study Session',
  subject: 'Mathematics',
  grade: 'Grade 8',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'm-welcome',
      role: 'model',
      content: `Hello! I'm **NeoNova AI Tutor**, your AI homework coach and study partner. 🎓\n\nAsk me any question from your homework, upload a photo of a worksheet, or test your skills with progressive testing stages!\n\n**Quick Tips:**\n- Tap the camera icon anytime to scan workbook pages.\n- Tap **"Help Me Understand"** on any problem for a crystal-clear everyday analogy and step-by-step reasoning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]
};

export default function App() {
  // Splash Screen State (Always displays luxurious 2.2s splash on cold start)
  const [hasBooted, setHasBooted] = useState<boolean>(false);

  // User Authentication State (Mandatory Account System - Persists until explicitly logged out)
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const saved = localStorage.getItem('neonova_auth_user') || localStorage.getItem('neonova_installed_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.username)) {
          const sub = getCurrentSubscriptionState();
          if (sub.status === 'active' && (sub.tier === 'plus' || sub.tier === 'pro')) {
            parsed.planTier = sub.tier;
            parsed.subscriptionStatus = 'active';
            if (sub.expiryTime) parsed.subscriptionExpires = sub.expiryTime;
            if (sub.billingCycle) parsed.billingCycle = sub.billingCycle;
          }
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<EduTab>('home');
  const [isPrivacyRoute, setIsPrivacyRoute] = useState<boolean>(false);
  const [isDeleteAccountRoute, setIsDeleteAccountRoute] = useState<boolean>(false);

  // Student Profile State
  const [studentName, setStudentName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('neonova_auth_user') || localStorage.getItem('neonova_installed_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentName) return parsed.studentName;
      }
    } catch {}
    return 'Alex';
  });
  const [studentAvatar, setStudentAvatar] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('neonova_auth_user') || localStorage.getItem('neonova_installed_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentAvatar) return parsed.studentAvatar;
      }
    } catch {}
    return '🎓';
  });
  const [currentGrade, setCurrentGrade] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('neonova_auth_user') || localStorage.getItem('neonova_installed_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.grade) return parsed.grade;
      }
    } catch {}
    return 'Grade 8';
  });
  const [currentSubject, setCurrentSubject] = useState<string>('Mathematics');
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([
    'Mathematics',
    'General Science',
    'Physics',
    'Computer Science'
  ]);
  const [academicXP, setAcademicXP] = useState<number>(() => getAcademicXP());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(DARK_MODE_KEY) === 'true';
  });

  // Subscription / Billing Tier (Checks verified subscription & user account)
  const [subscriptionState, setSubscriptionState] = useState<VerifiedSubscriptionState>(() => {
    const entitlement = getCurrentSubscriptionState();
    return entitlement;
  });
  const currentTier: PlanTier = subscriptionState.tier;

  // Modals & Overlays
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDrawingCanvasOpen, setIsDrawingCanvasOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTrustFooterOpen, setIsTrustFooterOpen] = useState(false);
  const [isPremiumLockOpen, setIsPremiumLockOpen] = useState(false);
  const [lockedFeatureInfo, setLockedFeatureInfo] = useState<{ name: string; tier: PlanTier; desc?: string }>({
    name: 'Advanced Feature',
    tier: 'plus'
  });
  const [isPaymentCheckoutOpen, setIsPaymentCheckoutOpen] = useState(false);
  const [checkoutTargetTier, setCheckoutTargetTier] = useState<'plus' | 'pro'>('plus');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isHelpGuideOpen, setIsHelpGuideOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [fontScale, setFontScale] = useState<'standard' | 'large' | 'xlarge'>(() => {
    try {
      const saved = localStorage.getItem('neonova_font_scale');
      if (saved === 'large' || saved === 'xlarge') return saved;
    } catch {}
    return 'standard';
  });
  const [isHighLegibility, setIsHighLegibility] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neonova_high_legibility') === 'true';
    } catch {
      return false;
    }
  });

  // Curriculum Board State (CBSE, ICSE, State, AP, IB, Cambridge)
  const [curriculumBoard, setCurriculumBoard] = useState<string>(() => {
    try {
      return localStorage.getItem('neonova_curriculum_board') || 'cbse';
    } catch {
      return 'cbse';
    }
  });

  const handleCurriculumBoardChange = (board: string) => {
    setCurriculumBoard(board);
    try {
      localStorage.setItem('neonova_curriculum_board', board);
    } catch {}
  };

  // Real-Time Voice Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Help Me Understand Modal
  const [helpMeUnderstandData, setHelpMeUnderstandData] = useState<{
    isOpen: boolean;
    question: string;
    answer?: string;
    subject?: string;
    grade?: string;
  }>({
    isOpen: false,
    question: '',
    answer: '',
    subject: 'Mathematics',
    grade: 'Grade 8'
  });

  // Context for Quiz / Stages launched from Subjects or other tools
  const [stageContext, setStageContext] = useState<{ subject: string; topic?: string } | null>(null);
  const [quizContext, setQuizContext] = useState<{ subject: string; topic?: string } | null>(null);
  const [neoVisionSection, setNeoVisionSection] = useState<string | null>(null);

  // Homework Helper Notebooks State
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    try {
      const saved = localStorage.getItem(NOTEBOOKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved notebooks', e);
    }
    return [INITIAL_NOTEBOOK];
  });
  const [activeNotebookId, setActiveNotebookId] = useState<string>(() => notebooks[0]?.id || INITIAL_NOTEBOOK.id);

  // Homework Chat Input State
  const [inputMessage, setInputMessage] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [homeworkViewMode, setHomeworkViewMode] = useState<'chat' | 'solver'>('chat');
  const [bypassTeacherDetector, setBypassTeacherDetector] = useState<boolean>(true);
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [currentNarratingId, setCurrentNarratingId] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Verify and auto-re-sync persistent authentication session on mount
  useEffect(() => {
    const verifySession = async () => {
      let localUser: AuthenticatedUser | null = null;
      try {
        const saved = localStorage.getItem('neonova_auth_user') || localStorage.getItem('neonova_installed_profile');
        if (saved) localUser = JSON.parse(saved);
      } catch {}

      const token = localStorage.getItem('neonova_auth_token');

      // Check current subscription entitlement
      const localSub = getCurrentSubscriptionState();
      if (localUser && localSub.status === 'active' && (localSub.tier === 'plus' || localSub.tier === 'pro')) {
        localUser.planTier = localSub.tier;
        localUser.subscriptionStatus = 'active';
        if (localSub.expiryTime) localUser.subscriptionExpires = localSub.expiryTime;
        if (localSub.billingCycle) localUser.billingCycle = localSub.billingCycle;
      }

      // If user hasn't registered or logged in yet on this device
      if (!localUser && !token) {
        setCurrentUser(null);
        setIsVerifyingSession(false);
        return;
      }

      // If local user exists, keep user logged in immediately! Never lock them out.
      if (localUser) {
        setCurrentUser(localUser);
        if (localUser.studentName) setStudentName(localUser.studentName);
        if (localUser.studentAvatar) setStudentAvatar(localUser.studentAvatar);
        if (localUser.grade) setCurrentGrade(localUser.grade);
      }

      try {
        const res = await fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            token: token || `neo_sess_${localUser?.id || Date.now()}`,
            clientBackup: localUser 
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            // Merge with local state to preserve active subscription tier
            const merged: AuthenticatedUser = {
              ...data.user,
              planTier: (localUser?.planTier && localUser.planTier !== 'starter') ? localUser.planTier : data.user.planTier,
              billingCycle: localUser?.billingCycle || data.user.billingCycle || 'monthly',
              subscriptionExpires: localUser?.subscriptionExpires || data.user.subscriptionExpires,
              subscriptionStatus: localUser?.subscriptionStatus || data.user.subscriptionStatus
            };
            setCurrentUser(merged);
            localStorage.setItem('neonova_auth_user', JSON.stringify(merged));
            localStorage.setItem('neonova_installed_profile', JSON.stringify(merged));
            if (merged.studentName) setStudentName(merged.studentName);
            if (merged.studentAvatar) setStudentAvatar(merged.studentAvatar);
            if (merged.grade) setCurrentGrade(merged.grade);
            
            // Re-sync subscription entitlement
            setSubscriptionState(getCurrentSubscriptionState());
          }
        } else {
          // If server didn't find token (e.g. server restarted or container reset),
          // DO NOT delete user account! Re-sync with server:
          if (localUser) {
            try {
              const syncRes = await fetch('/api/auth/sync-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: localUser, token })
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                if (syncData.token) {
                  localStorage.setItem('neonova_auth_token', syncData.token);
                }
                if (syncData.user) {
                  setCurrentUser(syncData.user);
                  localStorage.setItem('neonova_auth_user', JSON.stringify(syncData.user));
                  localStorage.setItem('neonova_installed_profile', JSON.stringify(syncData.user));
                }
              }
            } catch {}
          }
        }
      } catch (e) {
        console.warn('Session verification fallback to local user data', e);
      } finally {
        setIsVerifyingSession(false);
      }
    };
    verifySession();
  }, []);

  const handleAuthSuccess = (user: AuthenticatedUser, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('neonova_auth_token', token);
    localStorage.setItem('neonova_auth_user', JSON.stringify(user));
    localStorage.setItem('neonova_installed_profile', JSON.stringify(user));
    if (user.studentName) setStudentName(user.studentName);
    if (user.studentAvatar) setStudentAvatar(user.studentAvatar);
    if (user.grade) setCurrentGrade(user.grade);
    
    if (user.planTier === 'plus' || user.planTier === 'pro') {
      saveActiveSubscriptionPlan(user.planTier, user.billingCycle || 'monthly', user.studentName || user.username);
    }
    setSubscriptionState(getCurrentSubscriptionState());
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('neonova_auth_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
      } catch {}
    }
    localStorage.removeItem('neonova_auth_token');
    localStorage.removeItem('neonova_auth_user');
    setCurrentUser(null);
  };

  // URL Hash routing listener for deep links (#privacy, #delete-account)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy' || hash === '#/privacy') {
        setIsPrivacyRoute(true);
        setIsDeleteAccountRoute(false);
      } else if (hash === '#delete-account' || hash === '#/delete-account') {
        setIsDeleteAccountRoute(true);
        setIsPrivacyRoute(false);
      } else {
        setIsPrivacyRoute(false);
        setIsDeleteAccountRoute(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync font scaling class to html root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-standard', 'font-scale-large', 'font-scale-xlarge');
    root.classList.add(`font-scale-${fontScale}`);
    try {
      localStorage.setItem('neonova_font_scale', fontScale);
    } catch {}
  }, [fontScale]);

  // Sync high legibility class to html root
  useEffect(() => {
    const root = document.documentElement;
    if (isHighLegibility) {
      root.classList.add('high-legibility');
    } else {
      root.classList.remove('high-legibility');
    }
    try {
      localStorage.setItem('neonova_high_legibility', String(isHighLegibility));
    } catch {}
  }, [isHighLegibility]);

  // Global Keyboard Shortcuts (Ctrl+K for search, Escape for closing modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Open Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Escape: Close active modals
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsScannerOpen(false);
        setIsDrawingCanvasOpen(false);
        setIsProfileModalOpen(false);
        setIsTrustFooterOpen(false);
        setIsPremiumLockOpen(false);
        setIsPaymentCheckoutOpen(false);
        setIsMobileDrawerOpen(false);
        setIsHelpGuideOpen(false);
        setIsAdminPortalOpen(false);
        setHelpMeUnderstandData(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cycleFontScale = () => {
    setFontScale(prev => {
      if (prev === 'standard') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'standard';
    });
  };

  // Sync profile from localStorage on boot
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.avatar) setStudentAvatar(parsed.avatar);
        if (parsed.grade) setCurrentGrade(parsed.grade);
        if (parsed.preferredSubjects) setPreferredSubjects(parsed.preferredSubjects);
      }
    } catch (e) {
      console.warn('Failed to load profile', e);
    }
  }, []);

  // Save notebooks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks));
    } catch (e) {
      console.warn('Failed to persist notebooks', e);
    }
  }, [notebooks]);

  // Adjust XP helper
  const adjustXP = (amount: number) => {
    const updated = addAcademicXP(amount);
    setAcademicXP(updated);
  };

  // Profile save handler
  const handleSaveProfile = (name: string, grade: string, avatar: string, subjects: string[]) => {
    setStudentName(name);
    setCurrentGrade(grade);
    setStudentAvatar(avatar);
    setPreferredSubjects(subjects);
    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({ studentName: name, grade, avatar, preferredSubjects: subjects })
      );
      if (currentUser) {
        const updatedUser: AuthenticatedUser = {
          ...currentUser,
          studentName: name,
          grade,
          studentAvatar: avatar
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('neonova_auth_user', JSON.stringify(updatedUser));
        localStorage.setItem('neonova_installed_profile', JSON.stringify(updatedUser));

        fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            studentName: name,
            studentAvatar: avatar,
            grade
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
    setIsProfileModalOpen(false);
  };

  // Dark mode toggle
  const handleToggleDarkMode = (dark: boolean) => {
    setIsDarkMode(dark);
    try {
      localStorage.setItem(DARK_MODE_KEY, String(dark));
    } catch {}
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Feature locking trigger
  const handleFeatureLocked = (name: string, tier: PlanTier, desc?: string) => {
    setLockedFeatureInfo({ name, tier, desc });
    setIsPremiumLockOpen(true);
  };

  // Notebook operations
  const handleCreateNotebook = (sub = currentSubject, gr = currentGrade) => {
    const newNb: Notebook = {
      id: `nb-${Date.now()}`,
      title: `${sub} Session`,
      subject: sub,
      grade: gr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };
    setNotebooks(prev => [newNb, ...prev]);
    setActiveNotebookId(newNb.id);
  };

  const handleDeleteNotebook = (id: string) => {
    if (notebooks.length <= 1) return;
    setNotebooks(prev => prev.filter(n => n.id !== id));
    if (activeNotebookId === id) {
      const remaining = notebooks.filter(n => n.id !== id);
      setActiveNotebookId(remaining[0]?.id || '');
    }
  };

  // Homework message send handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputMessage.trim();
    if (!query && !attachedImage) return;

    let targetNb = notebooks.find(n => n.id === activeNotebookId);
    if (!targetNb) {
      handleCreateNotebook();
      targetNb = notebooks[0];
    }

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query || 'Analyze attached homework problem sheet',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: attachedImage ? { mimeType: attachedImage.mimeType, data: attachedImage.data } : undefined
    };

    const updatedMessages = [...(targetNb?.messages || []), userMsg];
    setNotebooks(prev =>
      prev.map(nb => (nb.id === targetNb?.id ? { ...nb, messages: updatedMessages } : nb))
    );

    const sendingImage = attachedImage;
    setInputMessage('');
    setAttachedImage(null);
    setIsChatLoading(true);
    setApiError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query || 'Please solve and explain the homework problem in the attached image with clear steps.',
          subject: targetNb?.subject || currentSubject,
          grade: targetNb?.grade || currentGrade,
          image: sendingImage
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "I've structured a breakdown for your homework. Feel free to ask any follow-up questions!";

      const modelMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setNotebooks(prev =>
        prev.map(nb =>
          nb.id === targetNb?.id ? { ...nb, messages: [...updatedMessages, modelMsg] } : nb
        )
      );

      adjustXP(15);
      addCompletedAssignment({
        title: query.slice(0, 32) || 'Homework Problem',
        subject: targetNb?.subject || currentSubject,
        grade: targetNb?.grade || currentGrade,
        type: 'homework_question',
        scorePercentage: 100,
        totalItems: 1,
        correctItems: 1,
        status: 'mastered',
        topic: targetNb?.subject || currentSubject,
        xpAwarded: 15
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      setApiError('Unable to generate answer. Please check your connection and retry.');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Speech Recognition dictation toggle
  const handleToggleDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isDictating) {
      speechRecognitionRef.current?.stop();
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsDictating(true);
      recognition.onend = () => setIsDictating(false);
      recognition.onerror = () => setIsDictating(false);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Dictation failed', e);
      setIsDictating(false);
    }
  };

  // Text-To-Speech speech synthesis
  const handleToggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (currentNarratingId === id) {
      window.speechSynthesis.cancel();
      setCurrentNarratingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = stripAllSymbolsForPlaintext(text).slice(0, 800);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setCurrentNarratingId(null);
    utterance.onerror = () => setCurrentNarratingId(null);
    setCurrentNarratingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Scanner image capture handler
  const handleCaptureScannerImage = (base64Data: string, mimeType: string) => {
    setAttachedImage({ data: base64Data, mimeType });
    setIsScannerOpen(false);
    setActiveTab('homework');
  };

  // Subscription updated handler (persists Pro or Plus mode for month or year)
  const handleSubscriptionUpdated = (newState: VerifiedSubscriptionState) => {
    saveLocalSubscription(newState);
    setSubscriptionState(newState);
    setIsPaymentCheckoutOpen(false);

    // Synchronize to active student user account
    if (currentUser) {
      const updatedUser: AuthenticatedUser = {
        ...currentUser,
        planTier: newState.tier,
        billingCycle: newState.billingCycle || 'monthly',
        subscriptionExpires: newState.expiryTime,
        subscriptionStatus: 'active'
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('neonova_auth_user', JSON.stringify(updatedUser));
      localStorage.setItem('neonova_installed_profile', JSON.stringify(updatedUser));

      // Asynchronously persist to server
      const token = localStorage.getItem('neonova_auth_token');
      fetch('/api/user/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          token,
          planTier: newState.tier,
          billingCycle: newState.billingCycle || 'monthly'
        })
      }).catch(() => {});
    }
  };

  // Boot splash complete
  const handleBootComplete = () => {
    sessionStorage.setItem('neonova_has_booted', 'true');
    setHasBooted(true);
  };

  // If initial boot splash is active
  if (!hasBooted) {
    return <SplashScreen onBootComplete={handleBootComplete} />;
  }

  // Standalone full-page views: Privacy Policy & Delete Account
  if (isPrivacyRoute) {
    return (
      <PrivacyPolicyPage
        onBackToApp={() => {
          window.location.hash = '';
          setIsPrivacyRoute(false);
        }}
      />
    );
  }

  if (isDeleteAccountRoute) {
    return (
      <DeleteAccountPage
        onBackToApp={() => {
          window.location.hash = '';
          setIsDeleteAccountRoute(false);
        }}
      />
    );
  }

  // MANDATORY USER LOGIN & ACCOUNT SYSTEM
  if (!currentUser) {
    return <NeoNovaAuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar Navigation */}
      <EduSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo(0, 0);
        }}
        onOpenPrivacyPolicy={() => setIsTrustFooterOpen(true)}
        academicXP={academicXP}
        currentGrade={currentGrade}
        currentTier={currentTier}
        onOpenHelpGuide={() => setIsHelpGuideOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6 min-h-screen">
        {/* Top Header */}
        <EduHeader
          currentGrade={currentGrade}
          onGradeChange={setCurrentGrade}
          currentSubject={currentSubject}
          onSubjectChange={setCurrentSubject}
          curriculumBoard={curriculumBoard}
          onCurriculumBoardChange={handleCurriculumBoardChange}
          onOpenVoiceTutor={() => setIsVoiceModalOpen(true)}
          onOpenAllFeatures={() => setActiveTab('study_tools')}
          studentName={studentName}
          studentAvatar={studentAvatar}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          academicXP={academicXP}
          currentTier={currentTier}
          onOpenPlans={() => setActiveTab('plans')}
          fontScale={fontScale}
          onCycleFontScale={cycleFontScale}
          onOpenHelpGuide={() => setIsHelpGuideOpen(true)}
          onLogout={handleLogout}
        />

        {/* Tab View Router */}
        <main className="flex-1 px-3 sm:px-6 py-4 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'home' && (
            <HomePage
              studentName={studentName}
              currentGrade={currentGrade}
              onNavigateTab={setActiveTab}
              onAskQuestion={(initialQ) => {
                if (initialQ) setInputMessage(initialQ);
                setActiveTab('homework');
              }}
              onOpenScanner={() => setIsScannerOpen(true)}
              onStartVoice={() => {
                setActiveTab('homework');
                setTimeout(() => handleToggleDictation(), 200);
              }}
              onSelectSubjectChapter={(sub, chTitle) => {
                setCurrentSubject(sub);
                setActiveTab('subjects');
              }}
              onOpenStudyTool={(toolId) => {
                if (toolId === 'drawing') setIsDrawingCanvasOpen(true);
                else if (toolId === 'quiz') setActiveTab('quiz');
                else if (toolId === 'daily') setActiveTab('daily');
                else if (toolId === 'memory') setActiveTab('memory');
                else if (toolId === 'notes') setActiveTab('notes');
                else if (toolId === 'career') setActiveTab('career');
                else if (toolId === 'alerts') setActiveTab('alerts');
                else if (toolId === 'three_d_lab') setActiveTab('three_d_lab');
                else if (toolId === 'animation_lab') setActiveTab('animation_lab');
                else setActiveTab(toolId as EduTab);
              }}
              currentTier={currentTier}
              onFeatureLocked={handleFeatureLocked}
              onOpenPlans={() => setActiveTab('plans')}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsPage
              currentGrade={currentGrade}
              onAskAIWithContext={(sub, topic) => {
                setCurrentSubject(sub);
                setInputMessage(`Explain the core principles of ${topic} in ${sub} with examples.`);
                setActiveTab('homework');
              }}
              onLaunchPracticeQuiz={(sub, topic) => {
                setQuizContext({ subject: sub, topic });
                setActiveTab('quiz');
              }}
              onOpenNotes={(sub) => {
                setCurrentSubject(sub);
                setActiveTab('notes');
              }}
              onLaunchStageSystem={(sub, topic) => {
                setStageContext({ subject: sub, topic });
                setActiveTab('stages');
              }}
            />
          )}

          {activeTab === 'stages' && (
            <StageSystemMain
              currentGrade={currentGrade}
              onGradeChange={setCurrentGrade}
              initialSubject={stageContext?.subject || currentSubject}
              initialTopic={stageContext?.topic}
              academicXP={academicXP}
              adjustXP={adjustXP}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'mission7' && (
            <Mission7EventHub
              studentName={studentName}
              currentGrade={currentGrade}
              curriculumBoard={curriculumBoard}
              academicXP={academicXP}
              adjustXP={adjustXP}
              onNavigateTab={setActiveTab}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {activeTab === 'homework' && (
            homeworkViewMode === 'chat' ? (
              <HomeworkHelperView
                notebooks={notebooks}
                activeNotebookId={activeNotebookId}
                onSelectNotebook={(id) => setActiveNotebookId(id)}
                onCreateNotebook={handleCreateNotebook}
                onDeleteNotebook={handleDeleteNotebook}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                attachedImage={attachedImage}
                setAttachedImage={setAttachedImage}
                isLoading={isChatLoading}
                apiError={apiError}
                onSendMessage={handleSendMessage}
                onOpenScanner={() => setIsScannerOpen(true)}
                isDictating={isDictating}
                onToggleDictation={handleToggleDictation}
                currentNarratingId={currentNarratingId}
                onToggleSpeak={handleToggleSpeak}
                bypassTeacherDetector={bypassTeacherDetector}
                setBypassTeacherDetector={setBypassTeacherDetector}
                onOpenHelpMeUnderstand={(q, a, s, g) =>
                  setHelpMeUnderstandData({
                    isOpen: true,
                    question: q,
                    answer: a,
                    subject: s || currentSubject,
                    grade: g || currentGrade
                  })
                }
                currentGrade={currentGrade}
                currentSubject={currentSubject}
                onOpenVoice={() => setIsVoiceModalOpen(true)}
                onSwitchToDeepSolver={() => setHomeworkViewMode('solver')}
              />
            ) : (
              <AIHomeworkSolverView
                currentSubject={currentSubject}
                currentGrade={currentGrade}
                curriculumBoard={curriculumBoard}
                userId={currentUser?.id || 'student-1'}
                onOpenVoice={() => setIsVoiceModalOpen(true)}
                onSwitchToChat={() => setHomeworkViewMode('chat')}
                onOpenScanner={() => setIsScannerOpen(true)}
                initialImage={attachedImage}
                onClearInitialImage={() => setAttachedImage(null)}
              />
            )
          )}

          {activeTab === 'practice' && (
            <AdaptivePracticeView
              currentSubject={currentSubject}
              currentGrade={currentGrade}
              curriculumBoard={curriculumBoard}
              userId={currentUser?.id || 'student-1'}
            />
          )}

          {activeTab === 'mistakes' && (
            <MistakesDashboard
              userId={currentUser?.id || 'student-1'}
              onNavigateToPractice={() => setActiveTab('practice')}
            />
          )}

          {activeTab === 'ai_tutor' && <NeoNovaAITutorTab />}

          {activeTab === 'study_tools' && (
            <StudyToolsPage
              onNavigateTab={setActiveTab}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenVoice={() => setIsVoiceModalOpen(true)}
              onLaunchTool={(toolId) => {
                if (toolId === 'drawing') setIsDrawingCanvasOpen(true);
                else if (toolId === 'quiz') setActiveTab('quiz');
                else if (toolId === 'daily') setActiveTab('daily');
                else if (toolId === 'memory') setActiveTab('memory');
                else if (toolId === 'notes') setActiveTab('notes');
                else if (toolId === 'career') setActiveTab('career');
                else if (toolId === 'alerts') setActiveTab('alerts');
                else if (toolId === 'homework_chat') {
                  setHomeworkViewMode('chat');
                  setActiveTab('homework');
                }
                else if (toolId === 'deep_solver') {
                  setHomeworkViewMode('solver');
                  setActiveTab('homework');
                }
                else if (toolId === 'three_d_lab') setActiveTab('three_d_lab');
                else if (toolId === 'animation_lab') setActiveTab('animation_lab');
                else setActiveTab(toolId as EduTab);
              }}
              onOpenNeoVisionSection={(section) => {
                setNeoVisionSection(section);
                setActiveTab('neovision_hub');
              }}
              currentTier={currentTier}
              onFeatureLocked={handleFeatureLocked}
            />
          )}

          {activeTab === 'library' && (
            <ClassicsLibrary
              onImportClassicBook={(title, author) => {
                handleCreateNotebook(currentSubject, currentGrade);
                setInputMessage(`Analyze the literary themes and structure of "${title}" by ${author}.`);
                setActiveTab('homework');
              }}
              adjustXP={adjustXP}
              currentGrade={currentGrade}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressTracker
              onNavigateToQuiz={(sub) => {
                if (sub) setCurrentSubject(sub);
                setActiveTab('quiz');
              }}
              onNavigateToChat={(query) => {
                if (query) setInputMessage(query);
                setActiveTab('homework');
              }}
              adjustXP={adjustXP}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              currentGrade={currentGrade}
              onGradeChange={setCurrentGrade}
              preferredSubjects={preferredSubjects}
              onToggleSubject={(subName) => {
                setPreferredSubjects(prev =>
                  prev.includes(subName) ? prev.filter(s => s !== subName) : [...prev, subName]
                );
              }}
              studentName={studentName}
              onUpdateName={setStudentName}
              onOpenPrivacyPolicy={() => setIsPrivacyRoute(true)}
              onOpenDeleteAccount={() => setIsDeleteAccountRoute(true)}
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
              currentTier={currentTier}
              onNavigateToPlans={() => setActiveTab('plans')}
              fontScale={fontScale}
              onChangeFontScale={setFontScale}
              isHighLegibility={isHighLegibility}
              onToggleHighLegibility={() => setIsHighLegibility(prev => !prev)}
              onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
              subscriptionState={subscriptionState}
              onUpdateSubscription={handleSubscriptionUpdated}
              currentUser={currentUser || undefined}
              onLogout={handleLogout}
              onReplaySplash={() => setHasBooted(false)}
            />
          )}

          {activeTab === 'plans' && (
            <PlansPage
              currentTier={currentTier}
              onSubscriptionUpdated={handleSubscriptionUpdated}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              studentName={studentName}
              studentAvatar={studentAvatar}
              currentGrade={currentGrade}
              preferredSubjects={preferredSubjects}
              academicXP={academicXP}
              username={currentUser?.username}
              userEmail={currentUser?.email}
              isEmailVerified={currentUser?.isEmailVerified}
              currentTier={currentTier}
              subscriptionState={subscriptionState}
              onLogout={handleLogout}
              onOpenSettings={() => setActiveTab('settings')}
              onOpenPrivacyPolicy={() => setIsTrustFooterOpen(true)}
            />
          )}

          {activeTab === 'quiz' && (
            <PracticeQuiz
              adjustXP={adjustXP}
              initialSubject={quizContext?.subject || currentSubject}
              initialTopic={quizContext?.topic}
            />
          )}

          {activeTab === 'daily' && <DailyHub onNavigateTab={setActiveTab} />}

          {activeTab === 'memory' && (
            <MemoryBooster
              notebooks={notebooks}
              activeNotebookId={activeNotebookId}
              adjustXP={adjustXP}
            />
          )}

          {activeTab === 'notes' && <NotesSummarizer adjustXP={adjustXP} />}

          {activeTab === 'career' && <FutureCareerMatch />}

          {activeTab === 'three_d_lab' && <ThreeDModelGenerator />}

          {activeTab === 'animation_lab' && <FormulaRoom />}

          {activeTab === 'alerts' && (
            <StudyAlertsPage
              onBackToTools={() => setActiveTab('study_tools')}
              onNavigateTab={setActiveTab}
              currentGrade={currentGrade}
              academicXP={academicXP}
            />
          )}

          {activeTab === 'neovision_hub' && (
            <NeoVisionHub
              initialSection={neoVisionSection}
              onOpenDirectPlayground={() => setIsDrawingCanvasOpen(true)}
              currentTier={currentTier}
              onFeatureLocked={handleFeatureLocked}
              academicXP={academicXP}
              adjustXP={adjustXP}
              currentGrade={currentGrade}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Bottom Mobile Navigation Bar */}
      <EduMobileNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo(0, 0);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
        onAskQuestion={(q) => {
          setInputMessage(q);
          setActiveTab('homework');
          setIsSearchOpen(false);
        }}
        onLaunchTool={(toolId) => {
          if (toolId === 'drawing') setIsDrawingCanvasOpen(true);
          else if (toolId === 'quiz') setActiveTab('quiz');
          else if (toolId === 'daily') setActiveTab('daily');
          else if (toolId === 'memory') setActiveTab('memory');
          else if (toolId === 'notes') setActiveTab('notes');
          else if (toolId === 'career') setActiveTab('career');
          else setActiveTab(toolId as EduTab);
          setIsSearchOpen(false);
        }}
        currentGrade={currentGrade}
      />

      {/* Optic Homework Scanner Camera Modal */}
      {isScannerOpen && (
        <OpticHomeworkScanner
          onCaptureImage={handleCaptureScannerImage}
          onClose={() => setIsScannerOpen(false)}
          currentSubject={currentSubject}
          currentGrade={currentGrade}
          curriculumBoard={curriculumBoard}
        />
      )}

      {/* Concept Explainer "Help Me Understand" Modal */}
      {helpMeUnderstandData.isOpen && (
        <HelpMeUnderstandModal
          isOpen={helpMeUnderstandData.isOpen}
          onClose={() =>
            setHelpMeUnderstandData(prev => ({ ...prev, isOpen: false }))
          }
          question={helpMeUnderstandData.question}
          answer={helpMeUnderstandData.answer}
          initialSubject={helpMeUnderstandData.subject}
          initialGrade={helpMeUnderstandData.grade}
          adjustXP={adjustXP}
        />
      )}

      {/* Interactive Mathematical Blackboard / Drawing Canvas */}
      <DrawingCanvas
        isActive={isDrawingCanvasOpen}
        onClose={() => setIsDrawingCanvasOpen(false)}
      />

      {/* Student Profile Customizer Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          currentProfile={{
            studentName,
            grade: currentGrade,
            avatar: studentAvatar,
            preferredSubjects
          }}
          onSave={handleSaveProfile}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Educational Trust & COPPA Safety Footer Modal */}
      <TrustFooterModal
        isOpen={isTrustFooterOpen}
        onClose={() => setIsTrustFooterOpen(false)}
      />

      {/* Premium Feature Lock Modal */}
      <PremiumLockModal
        isOpen={isPremiumLockOpen}
        onClose={() => setIsPremiumLockOpen(false)}
        requiredTier={lockedFeatureInfo.tier}
        featureName={lockedFeatureInfo.name}
        featureDescription={lockedFeatureInfo.desc}
        onViewPlans={() => {
          setIsPremiumLockOpen(false);
          setActiveTab('plans');
        }}
        onUpgradeNow={(tier) => {
          setIsPremiumLockOpen(false);
          setCheckoutTargetTier(tier);
          setIsPaymentCheckoutOpen(true);
        }}
      />

      {/* PhonePe QR & Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={isPaymentCheckoutOpen}
        onClose={() => setIsPaymentCheckoutOpen(false)}
        targetTier={checkoutTargetTier}
        onPaymentSuccess={handleSubscriptionUpdated}
        studentName={studentName}
      />

      {/* Mobile & Tablet Full Slide-out Drawer */}
      <MobileDrawerNav
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo(0, 0);
        }}
        currentGrade={currentGrade}
        onGradeChange={setCurrentGrade}
        academicXP={academicXP}
        currentTier={currentTier}
        studentName={studentName}
        studentAvatar={studentAvatar}
        fontScale={fontScale}
        onCycleFontScale={cycleFontScale}
        onOpenPrivacyPolicy={() => setIsTrustFooterOpen(true)}
        username={currentUser?.username}
        onLogout={handleLogout}
      />

      {/* How to Use & Accessibility Help Modal */}
      <AccessibilityHelpModal
        isOpen={isHelpGuideOpen}
        onClose={() => setIsHelpGuideOpen(false)}
        fontScale={fontScale}
        onCycleFontScale={cycleFontScale}
        isHighLegibility={isHighLegibility}
        onToggleHighLegibility={() => setIsHighLegibility(prev => !prev)}
      />

      {/* Real-Time Natural Voice AI Tutor Modal */}
      <RealtimeVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentSubject={currentSubject}
        currentGrade={currentGrade}
        curriculumBoard={curriculumBoard}
      />

      {/* Administrator Ledger & Verification Portal (Naisarg Ramdatti) */}
      <AdminPaymentPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />
    </div>
  );
}
