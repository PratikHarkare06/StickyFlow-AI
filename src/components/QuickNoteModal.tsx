import React from 'react';
import { X, Plus, Clock, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STICKY_COLORS, cn } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { NoteTemplatesModal, TEMPLATES, NoteTemplate } from './NoteTemplatesModal';

interface QuickNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (content: string, category: string, color: string, reminderDate?: string) => void;
}

const CATEGORIES = [
  { name: 'Work', color: 'yellow' },
  { name: 'Personal', color: 'pink' },
  { name: 'Ideas', color: 'blue' },
  { name: 'Urgent', color: 'cyan' },
];

export const QuickNoteModal: React.FC<QuickNoteModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [content, setContent] = React.useState('');
  const [selectedCat, setSelectedCat] = React.useState('Work');
  const [selectedColor, setSelectedColor] = React.useState('yellow');
  const [reminderDate, setReminderDate] = React.useState<string | undefined>(undefined);
  const [showReminder, setShowReminder] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  // Key used to force RichTextEditor to re-mount when template is applied
  const [editorKey, setEditorKey] = React.useState(0);

  // Reset when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setContent('');
      setSelectedCat('Work');
      setSelectedColor('yellow');
      setReminderDate(undefined);
      setShowReminder(false);
      setEditorKey(k => k + 1); // re-mount editor with empty content
    }
  }, [isOpen]);

  // Close on Escape (not Cmd+Enter — that saves)
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAdd();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, content]);

  const handleAdd = () => {
    // Strip HTML to check if there's actual text
    const stripped = new DOMParser().parseFromString(content, 'text/html').body.textContent || '';
    if (!stripped.trim()) return;
    onAdd(content, selectedCat, selectedColor, reminderDate);
    onClose();
  };

  const handleTemplate = (template: NoteTemplate) => {
    setContent(template.content);
    setSelectedCat(template.category);
    setSelectedColor(template.color);
    setEditorKey(k => k + 1); // re-mount editor so TipTap loads new HTML content
  };

  // Live word count from raw HTML
  const wordCount = React.useMemo(() => {
    const text = new DOMParser().parseFromString(content, 'text/html').body.textContent || '';
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [content]);

  const hasContent = (() => {
    const text = new DOMParser().parseFromString(content, 'text/html').body.textContent || '';
    return text.trim().length > 0;
  })();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl bg-card-app border border-border-app rounded-[2rem] p-6 lg:p-8 shadow-2xl relative z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-xl font-black text-text-app">Quick Stick</h3>
                  <p className="text-[10px] font-bold text-gray-500">⌘↵ to save · Esc to close</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Template picker button */}
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-app text-gray-500 hover:border-accent-blue/40 hover:text-accent-blue transition-all text-[11px] font-black"
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    Templates
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 bg-black/5 rounded-xl hover:bg-black/10 transition-colors text-gray-400 hover:text-text-app"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Rich Text Editor — key forces re-mount when template loads */}
              <div className="min-h-[160px] max-h-[40vh] overflow-y-auto mb-2">
                <RichTextEditor
                  key={editorKey}
                  content={content}
                  onChange={setContent}
                  editable={true}
                  placeholder="What's on your mind? Capture the flow..."
                  minHeight="140px"
                />
              </div>

              {/* Word count */}
              {wordCount > 0 && (
                <p className="text-[10px] font-bold text-gray-500 mb-3">{wordCount} word{wordCount !== 1 ? 's' : ''}</p>
              )}

              {/* Footer */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-5 border-t border-border-app gap-4">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => { setSelectedCat(cat.name); setSelectedColor(cat.color); }}
                      className={cn(
                        'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                        selectedCat === cat.name
                          ? `${STICKY_COLORS[cat.color as keyof typeof STICKY_COLORS]} shadow-lg scale-105 shadow-black/10`
                          : 'bg-black/5 text-gray-400 hover:bg-black/10'
                      )}
                    >
                      {selectedCat === cat.name && '✓ '}
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto justify-between">
                  {/* Reminder picker */}
                  <div className="relative">
                    <button
                      onClick={() => setShowReminder(r => !r)}
                      className={cn(
                        'p-2.5 transition-colors rounded-xl flex items-center gap-2',
                        reminderDate ? 'bg-sticky-pink/10 text-sticky-pink' : 'text-gray-500 hover:text-text-app hover:bg-black/5'
                      )}
                      title="Set reminder"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                    {showReminder && (
                      <div className="absolute bottom-full left-0 mb-3 bg-card-app border border-border-app p-4 rounded-2xl shadow-2xl z-50">
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Set Reminder</p>
                        <input
                          type="date"
                          value={reminderDate || ''}
                          onChange={(e) => setReminderDate(e.target.value || undefined)}
                          className="bg-black/10 border border-border-app rounded-lg px-3 py-2 text-xs font-bold text-text-app focus:outline-none focus:border-accent-blue/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Reminder badge */}
                  {reminderDate && (
                    <span
                      onClick={() => setReminderDate(undefined)}
                      className="text-[10px] font-bold text-sticky-pink bg-sticky-pink/10 px-2 py-1 rounded-lg cursor-pointer hover:bg-sticky-pink/20 transition-all"
                      title="Click to clear"
                    >
                      🔔 {reminderDate}
                    </span>
                  )}

                  {/* Add button */}
                  <button
                    onClick={handleAdd}
                    disabled={!hasContent}
                    className="bg-accent-blue text-black px-7 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-400/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 text-sm"
                  >
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    Stick It
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template picker modal */}
      <NoteTemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleTemplate}
      />
    </>
  );
};
