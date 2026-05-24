import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, RotateCcw, AlertTriangle, Clock, X } from 'lucide-react';
import { Note, cn } from '../types';
import { formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';

interface TrashPageProps {
  trashedNotes: Note[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export const TrashPage: React.FC<TrashPageProps> = ({ trashedNotes, onRestore, onPermanentDelete, onEmptyTrash }) => {
  const [confirmEmpty, setConfirmEmpty] = React.useState(false);

  return (
    <div className="space-y-8 pb-32 overflow-x-hidden mt-14 lg:mt-0">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:pr-[360px]">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Trash</h2>
          <p className="text-gray-400 font-bold text-sm">
            Deleted notes are kept for 30 days before permanent removal
          </p>
        </div>
        {trashedNotes.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setConfirmEmpty(true)}
              className="px-5 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Empty Trash
            </button>
            <AnimatePresence>
              {confirmEmpty && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-14 bg-card-app border border-red-500/30 rounded-2xl p-5 shadow-2xl z-50 min-w-[280px] space-y-4"
                >
                  <div className="flex items-center gap-3 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-black">Permanently delete all?</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold">
                    This action cannot be undone. {trashedNotes.length} note{trashedNotes.length !== 1 ? 's' : ''} will be permanently deleted.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmEmpty(false)}
                      className="flex-1 py-2.5 bg-text-app/5 rounded-xl text-xs font-black text-gray-500 hover:bg-text-app/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { onEmptyTrash(); setConfirmEmpty(false); }}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-black hover:bg-red-600 transition-all"
                    >
                      Delete Forever
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      {trashedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center">
          <Trash2 className="w-16 h-16 mb-6" />
          <p className="text-lg font-black uppercase tracking-widest">Trash is empty</p>
          <p className="text-xs font-bold text-gray-500 mt-2">Deleted notes will appear here for 30 days</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trashedNotes.map(note => {
            const plain = note.content.replace(/<[^>]*>/g, '').substring(0, 150);
            const deletedAt = parseISO(note.timestamp);
            const daysLeft = 30 - differenceInDays(new Date(), deletedAt);
            const urgency = daysLeft <= 7;

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card-app border border-border-app rounded-3xl p-6 shadow-lg space-y-4 group hover:border-border-app/80 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-app line-clamp-2 leading-relaxed">{plain || 'Untitled Note'}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">{note.category}</span>
                      <span className="text-[9px] font-bold text-gray-600 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        Deleted {formatDistanceToNow(deletedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full shrink-0 mt-1 shadow-sm"
                    style={{
                      backgroundColor:
                        note.color === 'yellow' ? '#FACC15' :
                        note.color === 'pink' ? '#EC4899' :
                        note.color === 'blue' ? '#3B82F6' :
                        note.color === 'green' ? '#10B981' :
                        note.color === 'cyan' ? '#06B6D4' : '#8B5CF6'
                    }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-delete countdown */}
                  <div className={cn(
                    "flex-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                    urgency ? "text-red-400" : "text-gray-600"
                  )}>
                    <AlertTriangle className={cn("w-3 h-3", urgency && "animate-pulse")} />
                    {daysLeft > 0 ? `Auto-deletes in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Deleting soon...'}
                  </div>

                  <button
                    onClick={() => onRestore(note.id)}
                    className="px-4 py-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-black transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                  <button
                    onClick={() => onPermanentDelete(note.id)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Delete forever"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
