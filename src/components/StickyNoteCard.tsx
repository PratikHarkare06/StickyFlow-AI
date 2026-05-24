import React from 'react';
import { Pin, X, Clock, Bell, ListTodo, GripHorizontal, Hash } from 'lucide-react';
import { Note, STICKY_COLORS, cn } from '../types';
import { motion } from 'motion/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StickyNoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  onClick?: () => void;
  onContextMenu?: (note: Note, e: React.MouseEvent) => void;
  onToggleSelect?: (id: string) => void;
  isSelected?: boolean;
  isSortable?: boolean;
}

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({ 
  note,
  onDelete, 
  onPin,
  onToggleComplete,
  onClick,
  onContextMenu,
  onToggleSelect,
  isSelected = false,
  isSortable = false
}) => {
  const colorClass = STICKY_COLORS[note.color as keyof typeof STICKY_COLORS] || STICKY_COLORS.yellow;
  
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: note.id,
    disabled: !isSortable
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout={!isDragging}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!isDragging ? { y: -8, rotate: note.id === '1' ? -1 : 1 } : undefined}
      className={cn(
        "relative p-3.5 lg:p-4.5 rounded-[1.25rem] lg:rounded-[1.5rem] aspect-[4/5] lg:aspect-square flex flex-col justify-between group transition-shadow duration-300 shadow-xl",
        colorClass,
        "hover:shadow-2xl",
        isDragging && "shadow-2xl ring-2 ring-white scale-105 opacity-90 cursor-grabbing",
        !isDragging && "cursor-pointer active:scale-95",
        isSelected && "ring-4 ring-accent-blue scale-[0.97]"
      )}
      onClick={(e) => {
        if (!isDragging) {
          if (onToggleSelect) {
            onToggleSelect(note.id);
          } else if (onClick) {
            onClick();
          }
        }
      }}
      onContextMenu={(e) => {
        if (onContextMenu) onContextMenu(note, e);
      }}
    >
      {/* Selection checkbox */}
      {(isSelected || onToggleSelect) && (
        <div className={cn(
          'absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 shadow-lg',
          isSelected ? 'bg-accent-blue border-accent-blue' : 'border-white/40 bg-black/20 opacity-0 group-hover:opacity-100'
        )}>
          {isSelected && <span className="text-black text-[10px] font-black">✓</span>}
        </div>
      )}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {isSortable && (
            <div 
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-black/50 hover:text-black/80 p-0.5 rounded transition-colors touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripHorizontal className="w-4 h-4" />
            </div>
          )}
          <span className="px-2.5 py-1 rounded-full bg-black/10 text-[8px] font-black uppercase tracking-widest">
            {note.category}
          </span>
        </div>
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="p-1 rounded-md hover:bg-black/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-sm lg:text-[15px] font-black leading-[1.4] line-clamp-5 flex-1 mt-3 whitespace-pre-line">
        {stripHtml(note.content)}
      </p>

      <div className="flex justify-between items-center mt-4">
        <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">
          {formatDate(note.timestamp)}
        </div>
        <div className="flex items-center gap-1.5 h-6 flex-wrap">
          {note.tags && note.tags.length > 0 && (
            <>
              {note.tags.slice(0, 2).map(tag => (
                <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-black/5 rounded-lg opacity-50 text-[8px] font-black uppercase tracking-widest">
                  <Hash className="w-2 h-2" />{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[8px] font-black opacity-40">+{note.tags.length - 2}</span>
              )}
            </>
          )}
          {note.subtasks && note.subtasks.length > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/5 rounded-lg opacity-40">
              <ListTodo className="w-3 h-3" />
              <span className="text-[10px] font-black">{note.subtasks.length}</span>
            </div>
          )}
          {note.reminderDate && (
            <div className="p-1 px-1.5 bg-black/5 rounded-lg opacity-40">
              <Bell className="w-3 h-3" />
            </div>
          )}
          {onPin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPin(note.id); }}
              className={cn(
                "p-1.5 rounded-xl transition-all hover:bg-black/10 flex items-center justify-center",
                note.isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-40"
              )}
            >
              <Pin className={cn("w-3.5 h-3.5", note.isPinned && "fill-current")} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
