import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, ArrowUpRight, X, Search, Hash } from 'lucide-react';
import { Note, cn } from '../types';

// ── Extract [[linked note]] references from content ─────────────────────────
export const extractNoteLinks = (content: string): string[] => {
  const matches = content.match(/\[\[([^\]]+)\]\]/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/\[\[|\]\]/g, '').trim());
};

// ── Find backlinks: notes that link TO a given note ─────────────────────────
export const findBacklinks = (targetNote: Note, allNotes: Note[]): Note[] => {
  const targetText = targetNote.content.replace(/<[^>]*>/g, '').toLowerCase();
  // Match by first 30 chars of stripped content as identifier
  const targetId = targetText.substring(0, 30).trim();
  if (!targetId) return [];

  return allNotes.filter(n => {
    if (n.id === targetNote.id) return false;
    const links = extractNoteLinks(n.content);
    return links.some(link => {
      const linkLower = link.toLowerCase();
      return targetText.includes(linkLower) || linkLower.includes(targetId.substring(0, 15));
    });
  });
};

// ── Render content with clickable links ─────────────────────────────────────
interface LinkedContentProps {
  content: string;
  notes: Note[];
  onNoteClick: (id: string) => void;
}

export const LinkedContent: React.FC<LinkedContentProps> = ({ content, notes, onNoteClick }) => {
  const processedContent = useMemo(() => {
    // Replace [[note reference]] with clickable spans
    return content.replace(/\[\[([^\]]+)\]\]/g, (_, linkText: string) => {
      const normalized = linkText.trim().toLowerCase();
      const matchedNote = notes.find(n => {
        const plain = n.content.replace(/<[^>]*>/g, '').toLowerCase();
        return plain.includes(normalized) || normalized.includes(plain.substring(0, 20));
      });
      
      if (matchedNote) {
        return `<span class="note-link inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent-blue/10 text-accent-blue font-bold text-xs cursor-pointer hover:bg-accent-blue/20 transition-colors" data-note-id="${matchedNote.id}">🔗 ${linkText}</span>`;
      }
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-500/10 text-gray-500 font-bold text-xs">❓ ${linkText}</span>`;
    });
  }, [content, notes]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const noteLink = target.closest('[data-note-id]');
    if (noteLink) {
      const noteId = noteLink.getAttribute('data-note-id');
      if (noteId) onNoteClick(noteId);
    }
  };

  return (
    <div
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

// ── Note Link Inserter: inline picker to insert [[links]] ───────────────────
interface NoteLinkInserterProps {
  notes: Note[];
  onInsert: (linkText: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteLinkInserter: React.FC<NoteLinkInserterProps> = ({ notes, onInsert, isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes
      .filter(n => !n.isTrashed && !n.isArchived)
      .filter(n => {
        const plain = n.content.replace(/<[^>]*>/g, '').toLowerCase();
        return plain.includes(q) || n.category.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [notes, search]);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      const plain = stripHtml(filtered[selectedIndex].content).substring(0, 40);
      onInsert(plain);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      className="bg-card-app border border-border-app rounded-2xl shadow-2xl z-50 w-[300px] overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-app">
        <Link2 className="w-4 h-4 text-accent-blue" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
          onKeyDown={handleKeyDown}
          placeholder="Link to a note..."
          className="flex-1 bg-transparent text-xs font-bold text-text-app focus:outline-none placeholder:text-gray-600"
        />
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-text-app rounded-lg">
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="max-h-[240px] overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No notes found</p>
          </div>
        ) : (
          filtered.map((note, i) => (
            <button
              key={note.id}
              onMouseEnter={() => setSelectedIndex(i)}
              onClick={() => {
                const plain = stripHtml(note.content).substring(0, 40);
                onInsert(plain);
                onClose();
              }}
              className={cn(
                "w-full text-left p-3 rounded-xl flex items-start gap-3 transition-colors",
                i === selectedIndex ? "bg-accent-blue/10" : "hover:bg-text-app/5"
              )}
            >
              <div className={cn(
                "w-2.5 h-2.5 rounded-full mt-1 shrink-0",
                note.color === 'blue' ? 'bg-blue-500' :
                note.color === 'pink' ? 'bg-pink-500' :
                note.color === 'green' ? 'bg-green-500' :
                note.color === 'purple' ? 'bg-purple-500' : 'bg-yellow-500'
              )} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-app line-clamp-1">{stripHtml(note.content)}</p>
                <p className="text-[9px] font-bold text-gray-600 mt-0.5">{note.category}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.div>
  );
};

// ── Backlinks Panel for TaskDetailsPage ──────────────────────────────────────
interface BacklinksPanelProps {
  note: Note;
  allNotes: Note[];
  onNoteClick: (id: string) => void;
}

export const BacklinksPanel: React.FC<BacklinksPanelProps> = ({ note, allNotes, onNoteClick }) => {
  const outgoingLinks = useMemo(() => {
    const linkTexts = extractNoteLinks(note.content);
    return linkTexts.map(linkText => {
      const normalized = linkText.toLowerCase();
      const matched = allNotes.find(n => {
        if (n.id === note.id) return false;
        const plain = n.content.replace(/<[^>]*>/g, '').toLowerCase();
        return plain.includes(normalized) || normalized.includes(plain.substring(0, 20));
      });
      return { text: linkText, note: matched };
    });
  }, [note, allNotes]);

  const backlinks = useMemo(() => findBacklinks(note, allNotes), [note, allNotes]);

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const totalLinks = outgoingLinks.length + backlinks.length;
  if (totalLinks === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-500" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Linked Notes</h4>
        </div>
        <span className="text-[9px] font-bold text-gray-600">{totalLinks} link{totalLinks !== 1 ? 's' : ''}</span>
      </div>

      {/* Outgoing links */}
      {outgoingLinks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 px-1">References</p>
          {outgoingLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => link.note && onNoteClick(link.note.id)}
              disabled={!link.note}
              className={cn(
                "w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 transition-colors",
                link.note ? "hover:bg-accent-blue/5 cursor-pointer" : "opacity-50 cursor-default"
              )}
            >
              <ArrowUpRight className="w-3 h-3 text-accent-blue shrink-0" />
              <span className="text-xs font-bold text-text-app line-clamp-1">
                {link.note ? stripHtml(link.note.content).substring(0, 40) : link.text}
              </span>
              {!link.note && <span className="text-[8px] font-bold text-gray-600">(not found)</span>}
            </button>
          ))}
        </div>
      )}

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 px-1">Mentioned in</p>
          {backlinks.map(bl => (
            <button
              key={bl.id}
              onClick={() => onNoteClick(bl.id)}
              className="w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 hover:bg-accent-blue/5 transition-colors"
            >
              <Link2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-text-app line-clamp-1">{stripHtml(bl.content).substring(0, 40)}</span>
                <span className="text-[8px] font-bold text-gray-600 ml-2">{bl.category}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
