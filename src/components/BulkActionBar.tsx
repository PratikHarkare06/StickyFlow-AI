import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Archive, CheckCircle2, X, Copy } from 'lucide-react';

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  onDeleteAll: (ids: string[]) => void;
  onArchiveAll: (ids: string[]) => void;
  onCompleteAll: (ids: string[]) => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedIds, onClear, onDeleteAll, onArchiveAll, onCompleteAll
}) => {
  const count = selectedIds.length;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-2 bg-card-app border border-border-app rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl"
        >
          {/* Count badge */}
          <div className="flex items-center gap-2 pr-3 border-r border-border-app">
            <span className="w-6 h-6 rounded-full bg-accent-blue text-black text-[11px] font-black flex items-center justify-center">
              {count}
            </span>
            <span className="text-sm font-black text-text-app whitespace-nowrap">
              {count === 1 ? 'note' : 'notes'} selected
            </span>
          </div>

          {/* Actions */}
          <button
            onClick={() => onCompleteAll(selectedIds)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all text-xs font-black"
            title="Mark all complete"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Complete</span>
          </button>

          <button
            onClick={() => onArchiveAll(selectedIds)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-all text-xs font-black"
            title="Archive all"
          >
            <Archive className="w-4 h-4" />
            <span className="hidden sm:inline">Archive</span>
          </button>

          <button
            onClick={() => onDeleteAll(selectedIds)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-xs font-black"
            title="Delete all"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Clear selection */}
          <button
            onClick={onClear}
            className="ml-2 p-2 rounded-xl text-gray-500 hover:text-text-app hover:bg-text-app/5 transition-all"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
