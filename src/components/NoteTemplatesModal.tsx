import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Zap, Bug, Coffee, BarChart2, Calendar, Target, BookOpen } from 'lucide-react';

export interface NoteTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  color: string;
  content: string;
}

export const TEMPLATES: NoteTemplate[] = [
  {
    id: 'meeting',
    label: 'Meeting Notes',
    icon: <Coffee className="w-4 h-4" />,
    category: 'Work',
    color: 'yellow',
    content: `<h2>Meeting Notes</h2><p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>Attendees:</strong> </p><p><strong>Agenda:</strong></p><ul><li>Item 1</li><li>Item 2</li></ul><p><strong>Action Items:</strong></p><ul><li>[ ] Follow up on...</li></ul><p><strong>Decisions Made:</strong></p><p></p>`,
  },
  {
    id: 'daily-standup',
    label: 'Daily Standup',
    icon: <Zap className="w-4 h-4" />,
    category: 'Work',
    color: 'blue',
    content: `<h2>Daily Standup</h2><p><strong>📅 Date:</strong> ${new Date().toLocaleDateString()}</p><p><strong>✅ Yesterday I did:</strong></p><ul><li></li></ul><p><strong>🚀 Today I will:</strong></p><ul><li></li></ul><p><strong>🚧 Blockers:</strong></p><ul><li>None</li></ul>`,
  },
  {
    id: 'bug-report',
    label: 'Bug Report',
    icon: <Bug className="w-4 h-4" />,
    category: 'Urgent',
    color: 'cyan',
    content: `<h2>Bug Report</h2><p><strong>🐛 Title:</strong> </p><p><strong>📍 Environment:</strong> </p><p><strong>Steps to Reproduce:</strong></p><ol><li>Step 1</li><li>Step 2</li><li>Step 3</li></ol><p><strong>Expected Behavior:</strong></p><p></p><p><strong>Actual Behavior:</strong></p><p></p><p><strong>Priority:</strong> 🔴 High / 🟡 Medium / 🟢 Low</p>`,
  },
  {
    id: 'weekly-review',
    label: 'Weekly Review',
    icon: <BarChart2 className="w-4 h-4" />,
    category: 'Personal',
    color: 'green',
    content: `<h2>Weekly Review</h2><p><strong>Week of:</strong> ${new Date().toLocaleDateString()}</p><p><strong>🏆 Wins this week:</strong></p><ul><li></li></ul><p><strong>📚 What I learned:</strong></p><ul><li></li></ul><p><strong>😔 What didn't go well:</strong></p><ul><li></li></ul><p><strong>🎯 Goals for next week:</strong></p><ul><li></li></ul>`,
  },
  {
    id: 'project-plan',
    label: 'Project Plan',
    icon: <Target className="w-4 h-4" />,
    category: 'Work',
    color: 'purple',
    content: `<h2>Project Plan</h2><p><strong>🎯 Goal:</strong> </p><p><strong>📅 Deadline:</strong> </p><p><strong>📋 Milestones:</strong></p><ol><li>M1: </li><li>M2: </li><li>M3: </li></ol><p><strong>⚠️ Risks:</strong></p><ul><li></li></ul><p><strong>✅ Success Criteria:</strong></p><ul><li></li></ul>`,
  },
  {
    id: 'book-notes',
    label: 'Book Notes',
    icon: <BookOpen className="w-4 h-4" />,
    category: 'Ideas',
    color: 'orange',
    content: `<h2>Book Notes</h2><p><strong>📖 Title:</strong> </p><p><strong>✍️ Author:</strong> </p><p><strong>⭐ Rating:</strong> /10</p><p><strong>💡 Key Ideas:</strong></p><ul><li></li></ul><p><strong>📌 Best Quotes:</strong></p><blockquote><p></p></blockquote><p><strong>🎬 Action Items:</strong></p><ul><li></li></ul>`,
  },
  {
    id: 'daily-journal',
    label: 'Daily Journal',
    icon: <Calendar className="w-4 h-4" />,
    category: 'Personal',
    color: 'pink',
    content: `<h2>Daily Journal</h2><p><strong>📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p><p><strong>😊 Mood:</strong> </p><p><strong>🌅 Morning Intention:</strong></p><p></p><p><strong>📖 Today's Reflection:</strong></p><p></p><p><strong>🙏 Grateful for:</strong></p><ul><li></li><li></li><li></li></ul>`,
  },
  {
    id: 'blank',
    label: 'Blank Note',
    icon: <FileText className="w-4 h-4" />,
    category: 'Work',
    color: 'yellow',
    content: '',
  },
];

interface NoteTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: NoteTemplate) => void;
}

export const NoteTemplatesModal: React.FC<NoteTemplatesModalProps> = ({ isOpen, onClose, onSelect }) => {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const COLOR_PREVIEW: Record<string, string> = {
    yellow: 'bg-[#FACC15]', pink: 'bg-[#EC4899]', blue: 'bg-[#3B82F6]',
    green: 'bg-[#10B981]', purple: 'bg-[#8B5CF6]', orange: 'bg-[#F59E0B]', cyan: 'bg-[#06B6D4]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={e => e.stopPropagation()}
            className="bg-card-app border border-border-app rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black">Choose a Template</h2>
                <p className="text-xs text-gray-500 font-bold">Start with a structured format</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-text-app rounded-xl hover:bg-text-app/5 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template grid */}
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onSelect(t); onClose(); }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border-app bg-text-app/5 hover:border-accent-blue/40 hover:bg-text-app/8 transition-all text-left group"
                >
                  <div className={`w-9 h-9 rounded-xl ${COLOR_PREVIEW[t.color] || 'bg-yellow-400'} flex items-center justify-center text-black shrink-0 shadow-lg`}>
                    {t.icon}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-text-app truncate">{t.label}</p>
                    <p className="text-[10px] font-bold text-gray-500">{t.category}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
