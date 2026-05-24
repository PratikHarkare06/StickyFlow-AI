import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, X, Plus, Hash, Search } from 'lucide-react';
import { cn } from '../types';

interface TagManagerProps {
  tags: string[];
  allTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  compact?: boolean;
}

const TAG_COLORS = [
  'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'bg-teal-500/15 text-teal-400 border-teal-500/30',
  'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
];

function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export const TagManager: React.FC<TagManagerProps> = ({ tags, allTags, onAddTag, onRemoveTag, compact = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isAdding]);

  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return allTags.filter(t => !tags.includes(t)).slice(0, 6);
    const q = inputValue.toLowerCase();
    return allTags.filter(t => t.toLowerCase().includes(q) && !tags.includes(t)).slice(0, 6);
  }, [inputValue, allTags, tags]);

  const handleAdd = (value?: string) => {
    const tag = (value || inputValue).trim().toLowerCase().replace(/[^a-z0-9-_ ]/g, '');
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
    }
    setInputValue('');
    setSelectedSuggestion(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[selectedSuggestion] && inputValue) {
        handleAdd(suggestions[selectedSuggestion]);
      } else {
        handleAdd();
      }
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setInputValue('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(i => Math.max(i - 1, 0));
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest",
              getTagColor(tag)
            )}
          >
            <Hash className="w-2.5 h-2.5" />
            {tag}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tags</h4>
        </div>
        <span className="text-[9px] font-bold text-gray-600">{tags.length} tag{tags.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {tags.map(tag => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest group cursor-default",
                getTagColor(tag)
              )}
            >
              <Hash className="w-3 h-3" />
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-0.5 p-0.5 rounded-md hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {isAdding ? (
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent-blue/40 bg-accent-blue/5 text-accent-blue">
              <Hash className="w-3 h-3" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setSelectedSuggestion(0); }}
                onKeyDown={handleKeyDown}
                onBlur={() => { if (!inputValue) setIsAdding(false); }}
                placeholder="type tag..."
                className="bg-transparent text-[10px] font-black uppercase tracking-widest w-20 focus:outline-none placeholder:text-accent-blue/40 text-accent-blue"
              />
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 bg-card-app border border-border-app rounded-xl shadow-2xl z-50 min-w-[160px] p-1 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={s}
                    onMouseDown={(e) => { e.preventDefault(); handleAdd(s); }}
                    onMouseEnter={() => setSelectedSuggestion(i)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors",
                      i === selectedSuggestion ? "bg-accent-blue/10 text-accent-blue" : "text-gray-500 hover:bg-text-app/5"
                    )}
                  >
                    <Hash className="w-3 h-3" />
                    {s}
                  </button>
                ))}
                {inputValue && !suggestions.includes(inputValue.toLowerCase()) && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleAdd(); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-emerald-400 hover:bg-emerald-500/5 transition-colors border-t border-border-app mt-1 pt-2"
                  >
                    <Plus className="w-3 h-3" />
                    Create "{inputValue}"
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-border-app text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-accent-blue hover:text-accent-blue transition-all"
          >
            <Plus className="w-3 h-3" />
            Add Tag
          </button>
        )}
      </div>
    </div>
  );
};

// ── Tag Filter Bar: horizontal tag chips for filtering ─────────────────────────
interface TagFilterBarProps {
  allTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ allTags, selectedTags, onToggle, onClear }) => {
  if (allTags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <Hash className="w-4 h-4 text-gray-500 shrink-0" />
      {selectedTags.length > 0 && (
        <button
          onClick={onClear}
          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors shrink-0"
        >
          Clear
        </button>
      )}
      {allTags.map(tag => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={cn(
            "px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
            selectedTags.includes(tag)
              ? getTagColor(tag)
              : "border-border-app text-gray-600 hover:border-gray-500"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
