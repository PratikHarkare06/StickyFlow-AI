import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minimize2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Note, STICKY_COLORS, cn } from '../types';

interface FocusModeProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ note, isOpen, onClose, onSave }) => {
  const [content, setContent] = React.useState(note.content);
  const [isDirty, setIsDirty] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [editorKey] = React.useState(() => Math.random().toString(36));

  // Sync when note changes
  React.useEffect(() => {
    setContent(note.content);
    setIsDirty(false);
  }, [note.id]);

  // Auto-save every 3 seconds if dirty
  React.useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => {
      onSave(content);
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }, 2500);
    return () => clearTimeout(t);
  }, [content, isDirty]);

  // Escape to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Save before closing
        if (isDirty) onSave(content);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isDirty, content]);

  const handleChange = (html: string) => {
    setContent(html);
    setIsDirty(true);
    setSaved(false);
  };

  const colorClass = STICKY_COLORS[note.color as keyof typeof STICKY_COLORS] || STICKY_COLORS.yellow;
  // Extract accent color from the note
  const accentHex = note.color === 'yellow' ? '#FACC15'
    : note.color === 'pink' ? '#EC4899'
    : note.color === 'blue' ? '#3B82F6'
    : note.color === 'green' ? '#10B981'
    : note.color === 'purple' ? '#8B5CF6'
    : note.color === 'orange' ? '#F59E0B'
    : '#06B6D4'; // cyan

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[300] bg-[#06070B] overflow-y-auto"
        >
          {/* Minimal toolbar */}
          <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-4 z-10">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: accentHex }}
              />
              <span className="text-xs font-black uppercase tracking-widest text-gray-600">
                {note.category} · Focus Mode
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-black text-emerald-500 uppercase tracking-widest"
                  >
                    ✓ Saved
                  </motion.span>
                )}
                {isDirty && !saved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-bold text-gray-600 uppercase tracking-widest"
                  >
                    Saving...
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                onClick={() => { if (isDirty) onSave(content); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-app text-gray-500 hover:text-text-app hover:border-gray-600 transition-all text-xs font-black"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Exit Focus <kbd className="ml-1 px-1.5 py-0.5 bg-white/5 rounded text-[9px]">Esc</kbd>
              </button>
            </div>
          </div>

          {/* Editor — wide comfortable column */}
          <div className="max-w-3xl mx-auto px-6 pt-24 pb-40">
            {/* Word count */}
            <div className="mb-8">
              {(() => {
                const text = new DOMParser().parseFromString(content, 'text/html').body.textContent || '';
                const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                const chars = text.length;
                const readMins = Math.max(1, Math.ceil(words / 200));
                return (
                  <span className="text-xs font-bold text-gray-700">
                    {words} words · {chars} chars · {readMins} min read
                  </span>
                );
              })()}
            </div>

            <RichTextEditor
              key={editorKey}
              content={content}
              onChange={handleChange}
              editable={true}
              placeholder="Start writing... (auto-saves every 3 seconds)"
              minHeight="60vh"
              className="text-2xl leading-[1.75] text-gray-200 font-semibold"
            />
          </div>

          {/* Bottom progress bar: words per session */}
          <div className="fixed bottom-0 left-0 right-0 py-3 px-8 flex items-center justify-center gap-6 border-t border-white/5">
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
              Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] border border-white/10">Esc</kbd> to exit · auto-saves every 3s
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
