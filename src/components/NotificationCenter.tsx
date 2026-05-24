import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, X, Clock, CheckCircle2, Trash2, Eye, Volume2 } from 'lucide-react';
import { Note, cn } from '../types';
import { formatDistanceToNow, parseISO, isBefore, isToday, isTomorrow, addDays, differenceInMinutes } from 'date-fns';

interface NotificationItem {
  id: string;
  noteId: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'reminder' | 'overdue' | 'upcoming';
  isRead: boolean;
}

interface NotificationCenterProps {
  notes: Note[];
  onNoteClick: (id: string) => void;
  onDismissReminder: (noteId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notes, onNoteClick, onDismissReminder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('notification_read_ids');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch { return new Set(); }
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Persist read IDs
  useEffect(() => {
    localStorage.setItem('notification_read_ids', JSON.stringify([...readIds]));
  }, [readIds]);

  const notifications = useMemo(() => {
    const now = new Date();
    const items: NotificationItem[] = [];

    notes.forEach(note => {
      if (!note.reminderDate || note.isCompleted || note.isArchived || note.isTrashed) return;
      const reminderDate = parseISO(note.reminderDate);
      const plainText = note.content.replace(/<[^>]*>/g, '').substring(0, 60);

      if (isBefore(reminderDate, now) && !isToday(reminderDate)) {
        items.push({
          id: `overdue-${note.id}`,
          noteId: note.id,
          title: 'Overdue Reminder',
          message: plainText || 'Untitled Note',
          timestamp: note.reminderDate,
          type: 'overdue',
          isRead: readIds.has(`overdue-${note.id}`),
        });
      } else if (isToday(reminderDate)) {
        items.push({
          id: `today-${note.id}`,
          noteId: note.id,
          title: 'Due Today',
          message: plainText || 'Untitled Note',
          timestamp: note.reminderDate,
          type: 'reminder',
          isRead: readIds.has(`today-${note.id}`),
        });
      } else if (isTomorrow(reminderDate) || differenceInMinutes(reminderDate, now) < 60 * 48) {
        items.push({
          id: `upcoming-${note.id}`,
          noteId: note.id,
          title: 'Upcoming',
          message: plainText || 'Untitled Note',
          timestamp: note.reminderDate,
          type: 'upcoming',
          isRead: readIds.has(`upcoming-${note.id}`),
        });
      }
    });

    // Sort: overdue first, then today, then upcoming
    const priority = { overdue: 0, reminder: 1, upcoming: 2 };
    items.sort((a, b) => priority[a.type] - priority[b.type]);
    return items;
  }, [notes, readIds]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => new Set([...prev, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(prev => new Set([...prev, ...notifications.map(n => n.id)]));
  }, [notifications]);

  const typeStyles = {
    overdue: { bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500', text: 'text-red-400' },
    reminder: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-500', text: 'text-amber-400' },
    upcoming: { bg: 'bg-accent-blue/10', border: 'border-accent-blue/30', dot: 'bg-accent-blue', text: 'text-accent-blue' },
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={cn(
          "relative p-2.5 rounded-xl transition-all",
          isOpen ? "bg-accent-blue/10 text-accent-blue" : "text-gray-500 hover:text-text-app hover:bg-text-app/5"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 top-12 w-[340px] bg-card-app border border-border-app rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-app">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent-blue" />
                <span className="text-sm font-black text-text-app">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-black">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-accent-blue transition-colors px-2 py-1"
                  >
                    Read All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-text-app rounded-lg hover:bg-text-app/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <BellOff className="w-8 h-8 mx-auto text-gray-600 mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-600">All caught up!</p>
                  <p className="text-[10px] text-gray-600 mt-1">No pending reminders</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map(notif => {
                    const style = typeStyles[notif.type];
                    return (
                      <motion.button
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                          markAsRead(notif.id);
                          onNoteClick(notif.noteId);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl transition-all group flex gap-3",
                          notif.isRead ? "opacity-50 hover:opacity-80" : "hover:bg-text-app/5",
                        )}
                      >
                        {/* Priority dot */}
                        <div className="mt-1.5 shrink-0">
                          <div className={cn("w-2 h-2 rounded-full", style.dot, !notif.isRead && "animate-pulse")} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", style.text)}>
                              {notif.title}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-text-app line-clamp-2 leading-relaxed">{notif.message}</p>
                          <p className="text-[9px] font-bold text-gray-600 mt-1 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDistanceToNow(parseISO(notif.timestamp), { addSuffix: true })}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDismissReminder(notif.noteId);
                            markAsRead(notif.id);
                          }}
                          className="p-1.5 text-gray-600 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all self-start mt-1"
                          title="Dismiss reminder"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border-app px-5 py-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 text-center">
                  {notifications.filter(n => n.type === 'overdue').length} overdue · {notifications.filter(n => n.type === 'reminder').length} today · {notifications.filter(n => n.type === 'upcoming').length} upcoming
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
