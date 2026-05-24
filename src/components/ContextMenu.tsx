import React, { useEffect, useRef } from 'react';
import { Pin, Copy, Trash2, Archive, CheckCircle2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Note } from '../types';

interface ContextMenuProps {
  note: Note | null;
  x: number;
  y: number;
  onClose: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  note, x, y, onClose,
  onPin, onDelete, onDuplicate, onToggleArchive, onToggleComplete, onEdit
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click-outside or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Clamp to viewport bounds
  const menuW = 200;
  const menuH = 240;
  const clampedX = Math.min(x, window.innerWidth - menuW - 16);
  const clampedY = Math.min(y, window.innerHeight - menuH - 16);

  if (!note) return null;

  const items = [
    {
      icon: <Edit3 className="w-4 h-4" />,
      label: 'Open Details',
      action: () => { onEdit(note.id); onClose(); },
      className: 'text-text-app',
    },
    {
      icon: <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />,
      label: note.isPinned ? 'Unpin' : 'Pin to Top',
      action: () => { onPin(note.id); onClose(); },
      className: 'text-amber-400',
    },
    {
      icon: <Copy className="w-4 h-4" />,
      label: 'Duplicate',
      action: () => { onDuplicate(note.id); onClose(); },
      className: 'text-accent-blue',
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: note.isCompleted ? 'Mark Incomplete' : 'Mark Complete',
      action: () => { onToggleComplete(note.id); onClose(); },
      className: 'text-emerald-400',
    },
    {
      icon: <Archive className="w-4 h-4" />,
      label: note.isArchived ? 'Unarchive' : 'Archive',
      action: () => { onToggleArchive(note.id); onClose(); },
      className: 'text-purple-400',
    },
    null, // separator
    {
      icon: <Trash2 className="w-4 h-4" />,
      label: 'Delete',
      action: () => { onDelete(note.id); onClose(); },
      className: 'text-red-400',
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.92, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{ position: 'fixed', top: clampedY, left: clampedX, zIndex: 999 }}
        className="bg-card-app border border-border-app rounded-2xl shadow-2xl py-1.5 min-w-[190px] backdrop-blur-xl overflow-hidden"
      >
        {items.map((item, i) =>
          item === null ? (
            <div key={`sep-${i}`} className="my-1 border-t border-border-app mx-2" />
          ) : (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm font-bold hover:bg-text-app/5 transition-colors ${item.className}`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        )}
      </motion.div>
    </AnimatePresence>
  );
};
