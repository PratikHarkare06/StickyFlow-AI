import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Note, STICKY_COLORS, cn } from '../types';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isSameMonth, addMonths, subMonths, parseISO, isToday 
} from 'date-fns';

interface CalendarViewProps {
  notes: Note[];
  onNoteClick: (id: string) => void;
  onAddClick: () => void;
}

const COLOR_DOTS: Record<string, string> = {
  yellow: '#FACC15',
  pink: '#EC4899',
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  orange: '#F59E0B',
  cyan: '#06B6D4',
};

export const CalendarView: React.FC<CalendarViewProps> = ({ notes, onNoteClick, onAddClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    
    // Pad start with empty slots for alignment
    const startDow = start.getDay();
    const padded: (Date | null)[] = Array.from({ length: startDow }, () => null);
    return [...padded, ...allDays];
  }, [currentMonth]);

  const notesOnDay = (day: Date) =>
    notes.filter(n => {
      if (isSameDay(parseISO(n.timestamp), day)) return true;
      if (n.reminderDate && isSameDay(parseISO(n.reminderDate), day)) return true;
      return false;
    });

  const selectedNotes = selectedDay ? notesOnDay(selectedDay) : [];

  return (
    <div className="space-y-8 pb-32 overflow-x-hidden mt-14 lg:mt-0">
      <header className="flex items-center justify-between lg:pr-[360px]">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Calendar</h2>
          <p className="text-gray-400 font-bold text-sm">Visualize your notes and reminders across time</p>
        </div>
        <button
          onClick={onAddClick}
          className="bg-accent-blue text-black px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Note
        </button>
      </header>

      <div className="bg-card-app border border-border-app rounded-[2rem] p-6 lg:p-8 shadow-xl">
        {/* Month navigator */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-3 rounded-2xl bg-text-app/5 text-gray-400 hover:text-text-app hover:bg-text-app/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-black tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h3>
          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-3 rounded-2xl bg-text-app/5 text-gray-400 hover:text-text-app hover:bg-text-app/10 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-600 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} />;
            const dayNotes = notesOnDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const today = isToday(day);

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(prev => prev && isSameDay(prev, day) ? null : day)}
                className={cn(
                  "relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border",
                  isSelected
                    ? "bg-accent-blue/10 border-accent-blue/40 shadow-lg"
                    : today
                      ? "bg-accent-blue/5 border-accent-blue/20"
                      : "border-transparent hover:bg-text-app/5",
                  !isSameMonth(day, currentMonth) && "opacity-30"
                )}
              >
                <span className={cn(
                  "text-sm font-black tabular-nums",
                  today ? "text-accent-blue" : "text-text-app",
                  isSelected && "text-accent-blue"
                )}>
                  {format(day, 'd')}
                </span>
                {dayNotes.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayNotes.slice(0, 3).map(n => (
                      <div
                        key={n.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: COLOR_DOTS[n.color] || '#A5C9FF' }}
                      />
                    ))}
                    {dayNotes.length > 3 && (
                      <span className="text-[7px] font-black text-gray-500">+{dayNotes.length - 3}</span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card-app border border-border-app rounded-[2rem] p-6 lg:p-8 shadow-xl"
        >
          <h3 className="text-lg font-black mb-1">{format(selectedDay, 'EEEE, MMMM d, yyyy')}</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6">
            {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''}
          </p>

          {selectedNotes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-bold text-sm">No notes on this day</p>
              <button
                onClick={onAddClick}
                className="mt-4 text-accent-blue font-black text-xs uppercase underline"
              >
                Create one
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedNotes.map(note => {
                const plain = note.content.replace(/<[^>]*>/g, '').substring(0, 100);
                return (
                  <button
                    key={note.id}
                    onClick={() => onNoteClick(note.id)}
                    className="w-full text-left flex items-center gap-4 p-4 rounded-2xl bg-text-app/5 border border-border-app hover:border-accent-blue/30 transition-all group"
                  >
                    <div
                      className="w-3 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: COLOR_DOTS[note.color] || '#A5C9FF' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-app line-clamp-1">{plain || 'Untitled'}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                        {note.category} · {format(parseISO(note.timestamp), 'h:mm a')}
                      </p>
                    </div>
                    {note.isCompleted && (
                      <span className="text-[9px] font-black text-emerald-400 uppercase">Done</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
