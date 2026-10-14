import React, { useState } from 'react';
import { 
  StageNumber, 
  StageQuestion, 
  StageTestAttempt 
} from '../../types/stageSystem';
import { generateStageQuestions, getTopicsForSubject } from '../../lib/stageQuestionGenerator';
import StageSelectionHub from './StageSelectionHub';
import StageTestRunner from './StageTestRunner';
import StageResultsView from './StageResultsView';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';
import { SUBJECTS } from '../../types';

interface StageSystemMainProps {
  currentGrade: string;
  onGradeChange: (grade: string) => void;
  initialSubject?: string;
  initialTopic?: string;
  academicXP?: number;
  adjustXP?: (amount: number) => void;
  onNavigateTab?: (tab: any) => void;
}

export default function StageSystemMain({
  currentGrade,
  onGradeChange,
  initialSubject,
  initialTopic,
  academicXP = 0,
  adjustXP,
  onNavigateTab
}: StageSystemMainProps) {
  const [currentSubject, setCurrentSubject] = useState<string>(initialSubject || SUBJECTS[0].name);
  const [selectedTopic, setSelectedTopic] = useState<string>(
    initialTopic || getTopicsForSubject(initialSubject || SUBJECTS[0].name)[0] || 'General Curriculum'
  );

  const [viewMode, setViewMode] = useState<'hub' | 'testing' | 'results'>('hub');
  const [activeStage, setActiveStage] = useState<StageNumber>(1);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => `sess_${Date.now()}`);
  const [testQuestions, setTestQuestions] = useState<StageQuestion[]>([]);
  const [latestAttempt, setLatestAttempt] = useState<StageTestAttempt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const handleStartStage = async (stageNum: StageNumber) => {
    const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setActiveSessionId(newSessionId);
    setActiveStage(stageNum);
    setIsLoading(true);
    setLoadingStep(`Preparing Stage ${stageNum} assessment for ${currentSubject}...`);
    try {
      const questions = await generateStageQuestions({
        sessionId: newSessionId,
        subject: currentSubject,
        grade: currentGrade,
        topic: selectedTopic,
        stageNumber: stageNum
      });
      setTestQuestions(questions);
      setViewMode('testing');
    } catch (err) {
      console.error('Failed to generate stage questions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishTest = (attempt: StageTestAttempt) => {
    setLatestAttempt(attempt);
    setViewMode('results');
  };

  const handleRetryStage = () => {
    handleStartStage(activeStage);
  };

  const handleContinueToNextStage = (nextStageNum: StageNumber) => {
    handleStartStage(nextStageNum);
  };

  const handleBackToHub = () => {
    setViewMode('hub');
  };

  return (
    <div className="w-full">
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <Loader2 size={28} className="animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Generating Stage Questions
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {loadingStep}
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                Grounded in {currentGrade} Standards
              </span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'hub' && (
        <StageSelectionHub
          currentSubject={currentSubject}
          onSubjectChange={(newSub) => {
            setCurrentSubject(newSub);
            const topics = getTopicsForSubject(newSub);
            if (topics.length > 0) setSelectedTopic(topics[0]);
          }}
          currentGrade={currentGrade}
          onGradeChange={onGradeChange}
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
          onStartStage={handleStartStage}
          academicXP={academicXP}
          onNavigateTab={onNavigateTab}
        />
      )}

      {viewMode === 'testing' && (
        <StageTestRunner
          key={activeSessionId}
          subject={currentSubject}
          grade={currentGrade}
          topic={selectedTopic}
          stageNumber={activeStage}
          questions={testQuestions}
          onFinishTest={handleFinishTest}
          onExitTest={handleBackToHub}
          adjustXP={adjustXP}
        />
      )}

      {viewMode === 'results' && latestAttempt && (
        <StageResultsView
          attempt={latestAttempt}
          onRetryStage={handleRetryStage}
          onContinueToNextStage={handleContinueToNextStage}
          onBackToHub={handleBackToHub}
          adjustXP={adjustXP}
        />
      )}
    </div>
  );
}
