import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NeoNovaLogo from '../common/NeoNovaLogo';

interface SplashScreenProps {
  onBootComplete: () => void;
}

export default function SplashScreen({ onBootComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<'initial' | 'entering' | 'ring' | 'sweep' | 'tagline' | 'hold' | 'exit'>('initial');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const ringGradId = useId();
  const auraGradId = useId();

  useEffect(() => {
    // Total duration planned: ~2.3 - 2.5 seconds
    // Stage 1: Entrance at 120ms (Logo fades in & scales 96% -> 100%)
    const t1 = setTimeout(() => {
      setStage('entering');
    }, 120);

    // Stage 2: Light tech ring appears at 450ms
    const t2 = setTimeout(() => {
      setStage('ring');
    }, 450);

    // Stage 3: Light sweep glides across the wordmark at 950ms
    const t3 = setTimeout(() => {
      setStage('sweep');
    }, 950);

    // Stage 4: Taglines smoothly reveal at 1250ms
    const t4 = setTimeout(() => {
      setStage('tagline');
    }, 1250);

    // Stage 5: Final tranquil hold on pure clean background at 1900ms
    const t5 = setTimeout(() => {
      setStage('hold');
    }, 1900);

    // Stage 6: Smooth fade-out transition into dashboard at 2250ms
    const t6 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2250);

    // Stage 7: Complete at 2500ms
    const t7 = setTimeout(() => {
      onBootComplete();
    }, 2520);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [onBootComplete]);

  // Keyboard or tap skip for accessibility & fast resumption
  const handleFastSkip = () => {
    if (!isFadingOut) {
      setIsFadingOut(true);
      setTimeout(() => {
        onBootComplete();
      }, 200);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        id="neonova-splash-screen"
        role="region"
        aria-label="NeoNova Educational Platform Loading"
        onClick={handleFastSkip}
        initial={{ opacity: 1 }}
        animate={{ opacity: isFadingOut ? 0 : 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white select-none overflow-hidden cursor-default font-sans"
      >
        {/* ======================================================== */}
        {/* 1. ULTRA-SUBTLE BACKGROUND: PURE WHITE WITH SOFT RADIANCE */}
        {/* ======================================================== */}
        
        {/* Center Soft Luminescence (Tender Blue & Violet Tint) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ 
            opacity: stage === 'hold' ? 0.35 : 0.75, 
            scale: stage === 'hold' ? 1.05 : 1 
          }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          {/* Subtle soft-indigo and light-violet center aura */}
          <div 
            className="w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full blur-[90px] sm:blur-[130px] opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(224, 231, 255, 0.55) 0%, rgba(237, 233, 254, 0.35) 45%, rgba(248, 250, 252, 0.1) 70%, rgba(255, 255, 255, 0) 100%)'
            }}
          />
        </motion.div>

        {/* Delicate Mathematical Vector Flow Lines (Ultra-Quiet Precision, No Clutter) */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035]"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100,280 C320,180 620,440 1020,320 C1240,260 1480,360 1600,340"
            stroke="#4338CA"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M-80,620 C280,720 720,520 1140,640 C1340,690 1520,610 1620,620"
            stroke="#6366F1"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <path
            d="M120,-80 C180,320 380,680 480,1020"
            stroke="#818CF8"
            strokeWidth="0.75"
          />
          <path
            d="M1320,-80 C1260,320 1060,680 960,1020"
            stroke="#818CF8"
            strokeWidth="0.75"
          />
        </svg>

        {/* Ambient Focal Particles (Extremely soft, sparse micro-glows) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage !== 'initial' ? 0.6 : 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-[35%] left-[46%] w-1.5 h-1.5 rounded-full bg-indigo-300/40 blur-[1px]" />
          <div className="absolute top-[62%] right-[44%] w-1.5 h-1.5 rounded-full bg-violet-300/35 blur-[1px]" />
        </motion.div>

        {/* ======================================================== */}
        {/* 2. CENTER COMPOSITION: REFINED LOGO & LIGHT RING */}
        {/* ======================================================== */}
        <div className="relative z-10 flex flex-col items-center justify-center px-6">
          
          {/* LOGO ICON & TECHNOLOGICAL OPTICAL RING CONTAINER */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center mb-5 sm:mb-6">
            
            {/* Soft Halo Backing Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: stage !== 'initial' ? 1 : 0,
                scale: stage === 'entering' || stage === 'ring' ? [0.9, 1.08, 1] : 1
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full blur-[24px]"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(255, 255, 255, 0) 75%)'
              }}
            />

            {/* Precision Circular Light Ring (Advanced EdTech Optical Perimeter) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none -rotate-90"
              viewBox="0 0 160 160"
            >
              <defs>
                <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#818CF8" stopOpacity="0.5" />
                  <stop offset="75%" stopColor="#C084FC" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.75" />
                </linearGradient>
                <filter id={auraGradId} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Extremely faint guide orbit */}
              <circle
                cx="80"
                cy="80"
                r="64"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="0.75"
                opacity="0.45"
              />

              {/* Active Animated Light Ring */}
              <motion.circle
                cx="80"
                cy="80"
                r="64"
                fill="none"
                stroke={`url(#${ringGradId})`}
                strokeWidth="1.5"
                strokeLinecap="round"
                filter={`url(#${auraGradId})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: stage === 'initial' ? 0 : 1,
                  opacity: stage === 'hold' ? 0.25 : stage !== 'initial' ? 0.85 : 0
                }}
                transition={{
                  pathLength: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
                  opacity: { duration: 0.8, ease: 'easeInOut' }
                }}
              />

              {/* Subtle Orbital Satellite Pip */}
              <motion.circle
                cx="80"
                cy="16"
                r="2"
                fill="#4F46E5"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: stage === 'ring' || stage === 'sweep' ? [0, 1, 0.4] : stage === 'tagline' ? 0.3 : 0,
                  scale: stage === 'ring' ? [0, 1.4, 1] : 1
                }}
                transition={{ duration: 0.9, delay: 0.4 }}
              />
            </svg>

            {/* Central Precision Crest Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ 
                opacity: stage !== 'initial' ? 1 : 0, 
                scale: stage !== 'initial' ? 1 : 0.92 
              }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-transparent flex items-center justify-center drop-shadow-[0_12px_28px_rgba(79,70,229,0.2)]"
            >
              <NeoNovaLogo size={80} glow showSparkle />
            </motion.div>
          </div>

          {/* ======================================================== */}
          {/* 3. CENTER WORDMARK: SLEEK DARK NAVY/BLACK WITH LIGHT SWEEP */}
          {/* ======================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ 
              opacity: stage !== 'initial' ? 1 : 0, 
              y: stage !== 'initial' ? 0 : 8,
              scale: stage !== 'initial' ? 1 : 0.96
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="relative flex flex-col items-center"
          >
            {/* The Main Wordmark */}
            <div className="relative inline-block overflow-hidden py-1 px-3">
              <h1 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-[-0.035em] text-[#0A1128] font-sans flex items-center justify-center">
                <span>Neo</span>
                <span className="text-[#1E1B4B] font-extrabold ml-[1px]">Nova</span>
              </h1>

              {/* Subtle Luxe Light Sweep Passing Across The Wordmark */}
              <motion.div
                initial={{ x: '-120%', opacity: 0 }}
                animate={{
                  x: stage === 'sweep' || stage === 'tagline' || stage === 'hold' ? '220%' : '-120%',
                  opacity: stage === 'sweep' ? 0.75 : 0
                }}
                transition={{ duration: 0.95, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-y-0 w-24 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)',
                  mixBlendMode: 'overlay',
                  transform: 'skewX(-24deg)'
                }}
              />
            </div>

            {/* ======================================================== */}
            {/* 4. PREMIUM TAGLINE & AI-POWERED LEARNING SUBTITLE */}
            {/* ======================================================== */}
            
            {/* Primary Educational Creed: LEARN • EXPLORE • ACHIEVE */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ 
                opacity: stage === 'tagline' || stage === 'hold' ? 1 : 0,
                y: stage === 'tagline' || stage === 'hold' ? 0 : 6
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3.5 flex items-center justify-center"
            >
              <p className="text-[10px] sm:text-[11.5px] font-medium tracking-[0.28em] sm:tracking-[0.32em] text-slate-700 uppercase font-sans select-none">
                LEARN <span className="text-indigo-400 font-bold mx-1.5 sm:mx-2">•</span> EXPLORE <span className="text-indigo-400 font-bold mx-1.5 sm:mx-2">•</span> ACHIEVE
              </p>
            </motion.div>

            {/* Secondary Soft Line: AI-Powered Learning */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ 
                opacity: stage === 'tagline' || stage === 'hold' ? 1 : 0,
                y: stage === 'tagline' || stage === 'hold' ? 0 : 4
              }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
              className="mt-1.5 flex items-center justify-center"
            >
              <span className="text-[9.5px] sm:text-[10.5px] font-normal tracking-[0.14em] text-slate-400 font-sans">
                AI-Powered Learning
              </span>
            </motion.div>

          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* 5. MINIMAL TRUST FOOTER (Non-obtrusive, clean EdTech feel) */}
        {/* ======================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 'tagline' || stage === 'hold' ? 0.7 : 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-6 sm:bottom-8 text-center pointer-events-none"
        >
          <span className="text-[9px] font-medium tracking-widest text-slate-400/80 uppercase">
            Academic Excellence &middot; Grade 1–12
          </span>
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}
