import React, { useMemo } from 'react';
import { Search, Bell, Plus, Zap, Circle, CheckCircle2, Loader } from 'lucide-react';
import { Note, STICKY_COLORS, cn } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_COLUMNS = [
  { id: 'todo', label: 'To Do', icon: Circle, color: 'text-gray-400', dot: '#94a3b8', accent: 'bg-gray-400/10 border-gray-400/20' },
  { id: 'in-progress', label: 'In Progress', icon: Loader, color: 'text-accent-blue', dot: '#A5C9FF', accent: 'bg-accent-blue/10 border-accent-blue/20' },
  { id: 'done', label: 'Done', icon: CheckCircle2, color: 'text-green-400', dot: '#4ade80', accent: 'bg-green-400/10 border-green-400/20' },
] as const;

type StatusId = 'todo' | 'in-progress' | 'done';

interface KanbanCardProps {
  note: Note;
  onMoveNext: () => void;
  onMovePrev: () => void;
  onClick: () => void;
  onDelete: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ note, onMoveNext, onMovePrev, onClick, onDelete }) => {
  const colorBg = STICKY_COLORS[note.color as keyof typeof STICKY_COLORS] || STICKY_COLORS.yellow;
  const isFirst = !note.status || note.status === 'todo';
  const isLast = note.status === 'done';

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className={cn('rounded-2xl shadow-lg relative group', colorBg)}>
      {/* Clickable body → open details */}
      <div
        className="p-4 cursor-pointer"
        onClick={onClick}
      >
        {/* Category badge */}
        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 block">
          {note.category}
        </span>

        {/* Content */}
        <p className="font-bold text-sm leading-snug line-clamp-3 mb-3">
          {stripHtml(note.content)}
        </p>

        {/* Subtask progress */}
        {note.subtasks && note.subtasks.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1 rounded-full bg-black/10">
              <div 
                className="h-1 rounded-full bg-black/30 transition-all"
                style={{ width: `${(note.subtasks.filter(s => s.isCompleted).length / note.subtasks.length) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-black opacity-50">
              {note.subtasks.filter(s => s.isCompleted).length}/{note.subtasks.length}
            </span>
          </div>
        )}

        {/* Reminder */}
        {note.reminderDate && (
          <p className="text-[9px] font-bold opacity-40">
            ⏰ {new Date(note.reminderDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Action toolbar — always visible, separate from card clickable body */}
      <div
        className="flex items-center justify-between px-3 pb-3 gap-2"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex gap-1.5">
          {!isFirst && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onMovePrev(); }}
              className="flex items-center gap-1 px-2 py-1 bg-black/15 hover:bg-black/25 active:bg-black/35 rounded-lg transition-colors text-[10px] font-black select-none"
              title="Move back"
              type="button"
            >
              ← Back
            </button>
          )}
          {!isLast && (
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onMoveNext(); }}
              className="flex items-center gap-1 px-2 py-1 bg-black/20 hover:bg-black/30 active:bg-black/40 rounded-lg transition-colors text-[10px] font-black select-none"
              title="Move forward"
              type="button"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black/20 rounded-full flex items-center justify-center text-[8px]">
          📌
        </div>
      )}
    </div>
  );
};



interface KanbanPageProps {
  notes: Note[];
  onAddNote: (content: string, category: string, color: string) => void;
  onUpdateStatus: (id: string, status: StatusId) => void;
  onDeleteNote: (id: string) => void;
  onPinNote: (id: string) => void;
  onToggleComplete: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewChange: (view: any) => void;
  onNoteClick: (id: string) => void;
  onOpenQuickNote?: () => void;
}

export const KanbanPage: React.FC<KanbanPageProps> = ({
  notes,
  onUpdateStatus,
  onDeleteNote,
  onNoteClick,
  searchQuery,
  onSearchChange,
  onViewChange,
  onOpenQuickNote
}) => {
  const notesByColumn = useMemo(() => {
    const filtered = searchQuery 
      ? notes.filter(n => n.content.toLowerCase().includes(searchQuery.toLowerCase()) || n.category.toLowerCase().includes(searchQuery.toLowerCase()))
      : notes;

    return {
      'todo': filtered.filter(n => (n.status === 'todo' || !n.status) && !n.isArchived && !n.isCompleted),
      'in-progress': filtered.filter(n => n.status === 'in-progress' && !n.isArchived),
      'done': filtered.filter(n => (n.status === 'done' || (n.isCompleted && n.status !== 'todo' && n.status !== 'in-progress')) && !n.isArchived),
    };
  }, [notes, searchQuery]);

  const getNextStatus = (current: StatusId | undefined): StatusId => {
    if (!current || current === 'todo') return 'in-progress';
    if (current === 'in-progress') return 'done';
    return 'done';
  };

  const getPrevStatus = (current: StatusId | undefined): StatusId => {
    if (!current || current === 'todo') return 'todo';
    if (current === 'in-progress') return 'todo';
    return 'in-progress';
  };

  const totalNotes = notes.filter(n => !n.isArchived).length;
  const doneNotes = notesByColumn['done'].length;
  const progressPct = totalNotes > 0 ? Math.round((doneNotes / totalNotes) * 100) : 0;

  return (
    <div className="space-y-6 lg:space-y-8 pb-32 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mt-14 lg:mt-0 lg:pr-[360px]">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-1">Kanban Flow</h2>
          <p className="text-gray-500 font-bold text-xs lg:text-sm">
            Visualize your progress — {doneNotes} of {totalNotes} tasks done ({progressPct}%)
          </p>
        </div>
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500 group-focus-within:text-text-app transition-colors" />
            <input 
              type="text" 
              placeholder="Filter board..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-card-app border border-border-app rounded-2xl py-2.5 lg:py-3 pl-11 lg:pl-12 pr-6 w-full lg:w-48 xl:w-64 focus:outline-none focus:border-accent-blue/50 transition-all font-bold text-sm text-text-app"
            />
          </div>
          <button 
            onClick={() => onViewChange('settings')}
            className="p-2.5 lg:p-3 bg-card-app border border-border-app rounded-2xl hover:bg-black/5 transition-colors relative group"
          >
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-text-app transition-colors" />
          </button>
        </div>
      </header>

      {/* Overall progress bar */}
      <div className="bg-card-app border border-border-app rounded-2xl p-4 flex items-center gap-4">
        <Zap className="w-5 h-5 text-accent-blue shrink-0" />
        <div className="flex-1">
          <div className="flex justify-between text-xs font-black mb-1.5">
            <span>Overall Progress</span>
            <span className="text-accent-blue">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-border-app rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent-blue rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        <span className="text-xs font-bold text-gray-500 shrink-0">{doneNotes}/{totalNotes}</span>
      </div>

      {/* Board Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {STATUS_COLUMNS.map(col => {
          const colNotes = notesByColumn[col.id];
          const ColIcon = col.icon;

          return (
            <div 
              key={col.id}
              className={cn('rounded-[2rem] border p-5 lg:p-6 min-h-[400px] flex flex-col', col.accent)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ColIcon className={cn('w-4 h-4', col.color)} />
                  <h3 className="font-black text-base">{col.label}</h3>
                </div>
                <span className={cn('text-xs font-black px-2.5 py-1 rounded-full border', col.accent, col.color)}>
                  {colNotes.length}
                </span>
              </div>

              {/* Notes */}
              <div className="flex-1 flex flex-col gap-3">
                <AnimatePresence>
                  {colNotes.map(note => (
                    <KanbanCard
                      key={note.id}
                      note={note}
                      onClick={() => onNoteClick(note.id)}
                      onDelete={() => onDeleteNote(note.id)}
                      onMoveNext={() => onUpdateStatus(note.id, getNextStatus(note.status as StatusId))}
                      onMovePrev={() => onUpdateStatus(note.id, getPrevStatus(note.status as StatusId))}
                    />
                  ))}
                </AnimatePresence>
                {colNotes.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-text-app/5 flex items-center justify-center mb-3">
                      <ColIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs font-bold text-gray-500">No notes here</p>
                    {col.id === 'todo' && (
                      <button
                        onClick={() => onOpenQuickNote?.()}
                        className="mt-3 text-xs font-black text-accent-blue hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add a note
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Quick Note Button */}
      <button 
        onClick={() => onOpenQuickNote?.()}
        className="fixed bottom-10 right-10 bg-accent-blue text-black px-6 py-4 rounded-full font-bold flex items-center gap-2.5 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-110 active:scale-95 transition-all z-50 text-sm"
      >
        <Plus className="w-5 h-5 stroke-[3px]" />
        Quick Note
      </button>
    </div>
  );
};
