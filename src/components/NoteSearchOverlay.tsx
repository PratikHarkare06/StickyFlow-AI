import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Pin, CheckCircle2, Tag, Clock, Archive } from 'lucide-react';
import { Note, STICKY_COLORS, cn } from '../types';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface NoteSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onNoteClick: (id: string) => void;
}

function stripHtml(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-accent-blue/30 text-text-app rounded px-0.5">$1</mark>');
}

export const NoteSearchOverlay: React.FC<NoteSearchOverlayProps> = ({ isOpen, onClose, notes, onNoteClick }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return notes.slice(0, 8);
    const q = query.toLowerCase();
    return notes
      .filter(n => {
        const plain = stripHtml(n.content).toLowerCase();
        return plain.includes(q) || n.category.toLowerCase().includes(q) || n.color.includes(q);
      })
      .slice(0, 12);
  }, [query, notes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      onNoteClick(results[selectedIdx].id);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 z-[201] w-[95%] max-w-2xl"
          >
            <div className="bg-card-app border border-border-app rounded-[2rem] shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-border-app">
                <Search className="w-5 h-5 text-gray-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search notes by content, category..."
                  className="flex-1 bg-transparent text-lg font-bold focus:outline-none text-text-app placeholder:text-gray-500"
                />
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-text-app rounded-xl hover:bg-text-app/5 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
                {results.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-gray-500 font-black text-sm uppercase tracking-widest">No results found</p>
                    <p className="text-gray-600 text-xs mt-2">Try a different search term</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((note, i) => {
                      const plain = stripHtml(note.content);
                      const preview = plain.length > 120 ? plain.substring(0, 120) + '...' : plain;
                      const colorHex = Object.entries(STICKY_COLORS).find(([k]) => k === note.color)?.[1]?.split(' ')[0]?.replace('bg-[', '').replace(']', '') || '#FACC15';

                      return (
                        <button
                          key={note.id}
                          onClick={() => { onNoteClick(note.id); onClose(); }}
                          onMouseEnter={() => setSelectedIdx(i)}
                          className={cn(
                            "w-full text-left px-4 py-4 rounded-2xl flex items-start gap-4 transition-all group",
                            i === selectedIdx ? "bg-accent-blue/10 border border-accent-blue/20" : "border border-transparent hover:bg-text-app/5"
                          )}
                        >
                          {/* Color dot */}
                          <div className="mt-1 shrink-0">
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white/10"
                              style={{ backgroundColor: colorHex }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div 
                              className="text-sm font-bold text-text-app line-clamp-1 mb-1"
                              dangerouslySetInnerHTML={{ __html: highlightMatch(preview.split('\n')[0] || 'Untitled', query) }}
                            />
                            {preview.length > 40 && (
                              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: highlightMatch(preview, query) }}
                              />
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />
                                {note.category}
                              </span>
                              <span className="text-[9px] font-bold text-gray-600 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDistanceToNow(parseISO(note.timestamp), { addSuffix: true })}
                              </span>
                              {note.isPinned && (
                                <span className="text-[9px] font-black text-sticky-yellow flex items-center gap-0.5">
                                  <Pin className="w-2.5 h-2.5" /> PIN
                                </span>
                              )}
                              {note.isCompleted && (
                                <span className="text-[9px] font-black text-emerald-400 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> DONE
                                </span>
                              )}
                              {note.isArchived && (
                                <span className="text-[9px] font-black text-orange-400 flex items-center gap-0.5">
                                  <Archive className="w-2.5 h-2.5" /> VAULT
                                </span>
                              )}
                            </div>
                          </div>

                          <ArrowRight className={cn(
                            "w-4 h-4 mt-1 shrink-0 transition-all",
                            i === selectedIdx ? "text-accent-blue" : "text-transparent group-hover:text-gray-500"
                          )} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-border-app text-[10px] font-black text-gray-600 uppercase tracking-widest">
                <div className="flex items-center gap-4">
                  <span>↑↓ Navigate</span>
                  <span>Enter Select</span>
                  <span>Esc Close</span>
                </div>
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
