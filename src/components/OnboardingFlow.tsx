import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StickyNote, Kanban, Star, Bell, CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <StickyNote className="w-8 h-8" />,
    title: "Welcome to StickyFlow ✨",
    description: "Your intelligent productivity workspace. Capture ideas, manage tasks, and stay organized — all in one beautiful place.",
    color: "from-blue-500 to-violet-500",
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "Create & Organize Notes",
    description: "Write notes with rich text. Pin important ones, add categories, set colors. Use the Quick Note button (bottom-right) to add one instantly.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: <Kanban className="w-8 h-8" />,
    title: "Visualize with Kanban",
    description: "Move notes through To Do → In Progress → Done. Watch your progress bar fill up as you complete tasks.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: "Never Miss a Deadline",
    description: "Set date reminders on any note. The Reminders page shows upcoming and overdue tasks. Enable desktop notifications in Settings.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI-Powered Features",
    description: "Open any note → click 'AI Summarize' to instantly condense long notes into bullet points. Export your notes as PDF, JSON, or CSV anytime.",
    color: "from-violet-500 to-pink-500",
  },
  {
    icon: <CheckCircle2 className="w-8 h-8" />,
    title: "You're all set! 🚀",
    description: "Use ⌘K to open the command palette, press ? for keyboard shortcuts. Your data is synced to the cloud. Let's get productive!",
    color: "from-accent-blue to-emerald-400",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleComplete = () => {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem('stickyflow_onboarded', '1');
      onComplete();
    }, 400);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="bg-card-app border border-border-app rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            {/* Background gradient blob */}
            <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br ${current.color} opacity-10 blur-3xl`} />

            {/* Skip */}
            <button
              onClick={handleComplete}
              className="absolute top-5 right-5 text-gray-500 hover:text-text-app transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step dots */}
            <div className="flex gap-1.5 mb-8">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-accent-blue' : 'w-1.5 bg-border-app hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
              {current.icon}
            </div>

            {/* Content */}
            <h2 className="text-2xl font-black text-text-app mb-3 leading-tight">
              {current.title}
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed mb-8 text-sm">
              {current.description}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">
                {step + 1} of {STEPS.length}
              </span>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-accent-blue text-black px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-blue/20"
              >
                {isLast ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
