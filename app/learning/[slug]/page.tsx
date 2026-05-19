'use client';

import { use, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X, Heart, Check, Volume2 } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { learningModules, type Question } from '@/data/learning';
import { useLearningProgress } from '@/hooks/useLearningProgress';

const MASCOTS = ['🐻', '🦊', '🐸', '🐼', '🐰'];

function getMascot(index: number) {
  return MASCOTS[index % MASCOTS.length];
}

// ─── Quiz Header ──────────────────────────────────────────────────────────────
function QuizHeader({
  onClose,
  progress,
  total,
  hearts,
}: {
  onClose: () => void;
  progress: number;
  total: number;
  hearts: number;
}) {
  const pct = (progress / total) * 100;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
      >
        <X size={18} style={{ color: '#b1bad3' }} />
      </motion.button>

      {/* Progress bar */}
      <div className="flex-1 mx-4">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#213743' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #00e676, #00c853)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Hearts */}
      <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: '#ff3b3011' }}>
        <Heart size={16} className="text-red-500" fill="currentColor" />
        <span className="font-black text-sm text-red-500">{hearts}</span>
      </div>
    </div>
  );
}

// ─── Answer Button ────────────────────────────────────────────────────────────
function AnswerButton({
  label,
  selected,
  onClick,
  disabled,
  isCorrect,
  isWrong,
  variant,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  variant?: 'button' | 'ordered';
}) {
  if (variant === 'ordered') {
    return (
      <motion.button
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left font-semibold transition-all"
        style={{
          borderColor: isCorrect ? '#00e67699' : isWrong ? '#e74c3c99' : selected ? '#00e67640' : 'rgba(255,255,255,0.08)',
          background:
            isCorrect ? '#00e67611' :
            isWrong ? '#e74c3c11' :
            selected ? '#00e67608' :
            'transparent',
          color: isCorrect ? '#00e676' : isWrong ? '#e74c3c' : '#fff',
          opacity: disabled ? 0.8 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black"
          style={{
            background: isCorrect ? '#00e67620' : isWrong ? '#e74c3c20' : '#21374360',
            color: isCorrect ? '#00e676' : isWrong ? '#e74c3c' : '#b1bad3',
          }}
        >
          {isCorrect ? '✓' : isWrong ? '✗' : '→'}
        </div>
        <span className="flex-1">{label}</span>
        {isCorrect && <Check size={16} />}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all border-2"
      style={{
        borderColor: isCorrect ? '#00e67699' : isWrong ? '#e74c3c99' : selected ? '#00e67640' : 'rgba(255,255,255,0.12)',
        background:
          isCorrect ? '#00e67620' :
          isWrong ? '#e74c3c20' :
          selected ? '#00e67608' :
          '#213743',
        color: isCorrect ? '#00e676' : isWrong ? '#e74c3c' : '#b1bad3',
        opacity: disabled ? 0.8 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </motion.button>
  );
}

// ─── Quiz Complete Screen ─────────────────────────────────────────────────────
function QuizComplete({
  correct,
  total,
  xpEarned,
  onClose,
  moduleColor,
}: {
  correct: number;
  total: number;
  xpEarned: number;
  onClose: () => void;
  moduleColor: string;
}) {
  const pct = Math.round((correct / total) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="rounded-3xl p-8 max-w-sm w-full text-center"
        style={{ background: '#1a2c38', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="text-5xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '🙌' : '✨'}
        </div>

        <h2 className="text-2xl font-black text-white mb-1">
          {pct >= 80 ? 'Perfect!' : pct >= 50 ? 'Great Job!' : 'Good try!'}
        </h2>

        <p className="text-sm mb-6" style={{ color: '#b1bad3' }}>
          You got {correct} out of {total} correct
        </p>

        {/* Score bar */}
        <div className="mb-6">
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: '#213743' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: moduleColor }}
              initial={{ width: '0%' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <div className="text-2xl font-black" style={{ color: moduleColor }}>
            {pct}%
          </div>
        </div>

        {/* XP earned */}
        <div
          className="rounded-xl p-4 mb-6 flex items-center justify-center gap-2"
          style={{ background: `${moduleColor}15`, border: `1px solid ${moduleColor}40` }}
        >
          <span className="text-2xl">⭐</span>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold" style={{ color: moduleColor }}>
              XP Earned
            </div>
            <div className="text-xl font-black text-white">{xpEarned} XP</div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-black"
          style={{ background: moduleColor }}
        >
          Return to Path
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Quiz Component ──────────────────────────────────────────────────────
function LearningQuiz({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const module = learningModules[slug];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [hearts, setHearts] = useState(4);
  const [correct, setCorrect] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { completeLesson } = useLearningProgress(slug);

  if (!module) return null;

  const question = module.questions[currentIndex];
  const isAnswered = answered;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const progress = currentIndex + 1;
  const total = module.questions.length;

  function handleCheckAnswer() {
    setAnswered(true);

    if (isCorrect) {
      setCorrect(c => c + 1);
    } else {
      setHearts(h => Math.max(0, h - 1));
    }
  }

  function handleNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      completeLesson(question.id, question.xp * correct);
      setCompleted(true);
    }
  }

  function handleSkip() {
    handleNext();
  }

  if (completed) {
    return (
      <QuizComplete
        correct={correct}
        total={total}
        xpEarned={question.xp * correct}
        onClose={onClose}
        moduleColor={module.badgeColor}
      />
    );
  }

  return (
    <>
      <QuizHeader progress={progress} total={total} hearts={hearts} onClose={onClose} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-8">
        {/* Mascot + Question */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Question type label */}
          <div className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: module.badgeColor }}>
            {question.type === 'multiple-choice' && '💬 Multiple Choice'}
            {question.type === 'select-ordered' && '📋 Select the Meaning'}
            {question.type === 'fill-blanks' && '✏️ Fill in the Blanks'}
          </div>

          {/* Main question title */}
          <h2 className="text-3xl font-black text-white mb-10 leading-tight">
            {question.prompt}
          </h2>

          {/* Mascot + content */}
          <div className="flex items-center gap-6 mb-12">
            <div className="text-6xl">{getMascot(currentIndex)}</div>
            <div
              className="flex-1 rounded-2xl p-6 border"
              style={{
                background: '#213743',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <div className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#b1bad3' }}>
                <Volume2 size={14} style={{ color: module.badgeColor }} />
                Prompt
              </div>
              <div className="text-lg font-bold text-white">{question.content}</div>
            </div>
          </div>

          {/* Answers */}
          <div
            className="space-y-3"
            style={{
              display: question.type === 'select-ordered' ? 'grid' : 'flex',
              gridTemplateColumns: question.type === 'select-ordered' ? '1fr' : undefined,
              flexWrap: question.type === 'multiple-choice' ? 'wrap' : undefined,
              gap: question.type === 'multiple-choice' ? '12px' : '12px',
              justifyContent: question.type === 'multiple-choice' ? 'center' : 'stretch',
            }}
          >
            {question.options.map((option, idx) => (
              <AnswerButton
                key={idx}
                label={option}
                selected={selectedAnswer === idx}
                onClick={() => !isAnswered && setSelectedAnswer(idx)}
                disabled={isAnswered}
                isCorrect={isAnswered && idx === question.correctAnswer}
                isWrong={isAnswered && selectedAnswer === idx && !isCorrect}
                variant={question.type === 'select-ordered' ? 'ordered' : 'button'}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-6 flex items-center gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSkip}
          disabled={!isAnswered}
          className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            background: '#213743',
            color: '#b1bad3',
            opacity: !isAnswered ? 0.5 : 1,
            cursor: !isAnswered ? 'not-allowed' : 'pointer',
          }}
        >
          SKIP
        </motion.button>

        {!isAnswered ? (
          <motion.button
            whileHover={selectedAnswer !== null ? { scale: 1.05 } : {}}
            whileTap={selectedAnswer !== null ? { scale: 0.95 } : {}}
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            className="ml-auto px-8 py-3 rounded-xl font-bold text-sm text-black"
            style={{
              background: selectedAnswer !== null ? module.badgeColor : '#6b7280',
              opacity: selectedAnswer !== null ? 1 : 0.5,
              cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed',
            }}
          >
            CHECK
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="ml-auto px-8 py-3 rounded-xl font-bold text-sm text-black flex items-center gap-2"
            style={{ background: module.badgeColor }}
          >
            {currentIndex === total - 1 ? 'FINISH' : 'NEXT'}
            <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </motion.button>
        )}
      </div>
    </>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function LearningPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { slug } = use(params);
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <PageShell>
      <AnimatePresence mode="wait">
        {showQuiz ? (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col"
            style={{ background: '#0f212e' }}
          >
            <LearningQuiz slug={slug} onClose={() => setShowQuiz(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/promotions')}
              className="mb-8 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: '#213743', color: '#b1bad3' }}
            >
              <ChevronLeft size={16} />
              Back
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-6xl mb-6"
            >
              {learningModules[slug]?.icon}
            </motion.div>

            <h1 className="text-4xl font-black text-white mb-3">
              {learningModules[slug]?.title}
            </h1>

            <p className="text-lg mb-8 max-w-md" style={{ color: '#b1bad3' }}>
              {learningModules[slug]?.description}
            </p>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{ background: '#213743', color: '#b1bad3' }}>
                {learningModules[slug]?.questions.length} Questions
              </span>
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{ background: '#213743', color: '#b1bad3' }}>
                4 Lives
              </span>
              <span className="text-sm font-semibold px-3 py-1.5 rounded-full" style={{ background: '#213743', color: '#b1bad3' }}>
                ~5 minutes
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuiz(true)}
              className="px-12 py-4 rounded-2xl font-bold text-lg text-black"
              style={{
                background: `linear-gradient(135deg, ${learningModules[slug]?.badgeColor}, ${learningModules[slug]?.badgeColor}cc)`,
                boxShadow: `0 0 30px ${learningModules[slug]?.glowColor}`,
              }}
            >
              Start Quiz
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
