import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  {
    group: '🧭 Navigation',
    items: [
      { keys: ['⌘', 'K'], label: 'Open Command Palette' },
      { keys: ['?'], label: 'Show Keyboard Shortcuts' },
      { keys: ['⌘', 'Z'], label: 'Undo last action' },
    ],
  },
  {
    group: '📝 Notes',
    items: [
      { keys: ['N'], label: 'Quick Add Note' },
      { keys: ['⌘', 'Enter'], label: 'Save current note' },
      { keys: ['Esc'], label: 'Close modal / Cancel edit' },
      { keys: ['Del'], label: 'Delete selected note' },
    ],
  },
  {
    group: '🖱️ Card Actions',
    items: [
      { keys: ['Right Click'], label: 'Open context menu on note' },
      { keys: ['Click'], label: 'Open note details' },
      { keys: ['P'], label: 'Pin / Unpin note (in details)' },
      { keys: ['E'], label: 'Enter edit mode (in details)' },
    ],
  },
  {
    group: '🎨 Views',
    items: [
      { keys: ['1'], label: 'Go to Dashboard' },
      { keys: ['2'], label: 'Go to Kanban Board' },
      { keys: ['3'], label: 'Go to Reminders' },
      { keys: ['4'], label: 'Go to Completed' },
      { keys: ['5'], label: 'Go to Archive' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={e => e.stopPropagation()}
            className="bg-card-app border border-border-app rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-app">Keyboard Shortcuts</h2>
                  <p className="text-xs text-gray-500 font-bold">Press <kbd className="px-1.5 py-0.5 bg-text-app/10 rounded text-[10px] font-black">?</kbd> to toggle</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-text-app rounded-xl hover:bg-text-app/5 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SHORTCUTS.map(group => (
                <div key={group.group} className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{group.group}</p>
                  {group.items.map(item => (
                    <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-xl bg-text-app/5 hover:bg-text-app/8 transition-colors">
                      <span className="text-sm font-bold text-gray-400">{item.label}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, i) => (
                          <React.Fragment key={k}>
                            <kbd className="px-2 py-1 bg-card-app border border-border-app rounded-lg text-[11px] font-black text-text-app shadow-sm min-w-[28px] text-center">
                              {k}
                            </kbd>
                            {i < item.keys.length - 1 && <span className="text-gray-600 text-[10px]">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <p className="text-center text-[11px] text-gray-600 font-bold mt-8 pt-6 border-t border-border-app">
              StickyFlow · Press <kbd className="px-1 py-0.5 bg-text-app/10 rounded text-[10px]">Esc</kbd> to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
