import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '../types';

export interface NoteFilters {
  categories: string[];
  colors: string[];
  hasPinned: boolean | null;
  hasReminder: boolean | null;
  hasSubtasks: boolean | null;
}

export const DEFAULT_FILTERS: NoteFilters = {
  categories: [],
  colors: [],
  hasPinned: null,
  hasReminder: null,
  hasSubtasks: null,
};

export const isFiltersActive = (f: NoteFilters) =>
  f.categories.length > 0 || f.colors.length > 0 ||
  f.hasPinned !== null || f.hasReminder !== null || f.hasSubtasks !== null;

interface FilterPanelProps {
  filters: NoteFilters;
  onChange: (f: NoteFilters) => void;
  onClear: () => void;
  resultCount: number;
}

const CATS = ['Work', 'Personal', 'Ideas', 'Urgent'];
const COLORS = [
  { key: 'yellow', hex: '#FACC15', label: 'Yellow' },
  { key: 'pink',   hex: '#EC4899', label: 'Pink'   },
  { key: 'blue',   hex: '#3B82F6', label: 'Blue'   },
  { key: 'green',  hex: '#10B981', label: 'Green'  },
  { key: 'purple', hex: '#8B5CF6', label: 'Purple' },
  { key: 'orange', hex: '#F59E0B', label: 'Orange' },
  { key: 'cyan',   hex: '#06B6D4', label: 'Cyan'   },
];

function toggleArr<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, onClear, resultCount }) => {
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const [panelPos, setPanelPos] = React.useState({ top: 0, right: 0 });
  const active = isFiltersActive(filters);

  // Calculate drop position so it's always visible
  const openPanel = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // Align panel's right edge with button's right edge
      // If that would overflow left, clamp it
      const panelWidth = 304; // w-76 ≈ 304px
      const rightFromEdge = window.innerWidth - rect.right;
      setPanelPos({
        top: rect.bottom + 10,
        right: Math.max(8, rightFromEdge),
      });
    }
    setOpen(o => !o);
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={openPanel}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-black text-xs transition-all whitespace-nowrap',
          active
            ? 'bg-accent-blue text-black border-accent-blue shadow-lg shadow-accent-blue/20'
            : 'bg-text-app/5 border-border-app text-gray-400 hover:border-accent-blue/40 hover:text-text-app'
        )}
      >
        <SlidersHorizontal className="w-4 h-4 shrink-0" />
        Filter
        {active && (
          <span className="bg-black/20 rounded-full px-1.5 py-0.5 text-[10px] font-black">
            {[
              filters.categories.length,
              filters.colors.length,
              filters.hasPinned !== null ? 1 : 0,
              filters.hasReminder !== null ? 1 : 0,
              filters.hasSubtasks !== null ? 1 : 0,
            ].reduce((a, b) => a + b, 0)}
          </span>
        )}
      </button>

      {/* Fixed-position dropdown — avoids overflow clipping */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              style={{
                position: 'fixed',
                top: panelPos.top,
                right: panelPos.right,
                width: 304,
                zIndex: 100,
              }}
              className="bg-card-app border border-border-app rounded-3xl shadow-2xl p-5 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Filter Notes</span>
                <div className="flex items-center gap-2">
                  {active && (
                    <button
                      onClick={() => { onClear(); setOpen(false); }}
                      className="text-[10px] font-black text-accent-blue hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-text-app">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2.5">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {CATS.map(cat => (
                    <button
                      key={cat}
                      onClick={() => onChange({ ...filters, categories: toggleArr(filters.categories, cat) })}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-[11px] font-black border transition-all',
                        filters.categories.includes(cat)
                          ? 'bg-accent-blue text-black border-accent-blue'
                          : 'bg-text-app/5 border-border-app text-gray-400 hover:border-accent-blue/40 hover:text-text-app'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2.5">Color</p>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c.key}
                      onClick={() => onChange({ ...filters, colors: toggleArr(filters.colors, c.key) })}
                      title={c.label}
                      className={cn(
                        'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                        filters.colors.includes(c.key)
                          ? 'border-white scale-125 shadow-lg ring-2 ring-white/30'
                          : 'border-transparent'
                      )}
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Status toggles */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status</p>
                {([
                  { label: '📌 Pinned only',   key: 'hasPinned'   as const },
                  { label: '🔔 Has reminder',  key: 'hasReminder' as const },
                  { label: '✅ Has subtasks',   key: 'hasSubtasks' as const },
                ]).map(({ label, key }) => (
                  <button
                    key={key}
                    onClick={() => onChange({ ...filters, [key]: filters[key] === null ? true : null })}
                    className={cn(
                      'flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all text-left',
                      filters[key] !== null
                        ? 'bg-accent-blue/10 border border-accent-blue/30 text-accent-blue'
                        : 'bg-text-app/5 border border-border-app text-gray-400 hover:border-accent-blue/30 hover:text-text-app'
                    )}
                  >
                    {label}
                    <span className={cn(
                      'w-3.5 h-3.5 rounded-full border-2 shrink-0 ml-2',
                      filters[key] !== null ? 'bg-accent-blue border-accent-blue' : 'border-gray-600'
                    )} />
                  </button>
                ))}
              </div>

              {/* Result count */}
              <p className="text-[10px] font-black text-center text-gray-500 pt-2 border-t border-border-app">
                {resultCount} note{resultCount !== 1 ? 's' : ''} match current filters
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
