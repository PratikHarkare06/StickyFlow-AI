import React from 'react';
import { Search, Bell, Calendar, Clock, Plus, MoreVertical, CheckCircle2 } from 'lucide-react';
import { Note, STICKY_COLORS, cn } from '../types';
import { motion } from 'motion/react';

interface RemindersPageProps {
  notes: Note[];
  onToggleComplete: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewChange: (view: any) => void;
  onNoteClick: (id: string) => void;
  onAddClick: () => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({ 
  notes, 
  onToggleComplete,
  searchQuery,
  onSearchChange,
  onViewChange,
  onNoteClick,
  onAddClick
}) => {
  const reminderNotes = notes.filter(n => n.reminderDate && !n.isArchived);
  const upcomingNotes = reminderNotes.filter(n => !n.isCompleted);
  const completedReminders = reminderNotes.filter(n => n.isCompleted);
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthName = today.toLocaleString('default', { month: 'long' });

  const overdueNotes = upcomingNotes.filter(n => {
    if (!n.reminderDate) return false;
    const remDate = new Date(n.reminderDate);
    const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return remDate < todayReset;
  });

  const hasReminderOnDay = (day: number) => {
    return reminderNotes.some(n => {
      if (!n.reminderDate) return false;
      const d = new Date(n.reminderDate);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  };

  return (
    <div className="space-y-6 lg:space-y-10 pb-32 overflow-x-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mt-14 lg:mt-0 lg:pr-[360px]">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-1">Reminders</h2>
          <p className="text-gray-500 font-bold text-xs lg:text-sm">Never miss a flow. Manage your upcoming tasks and alerts.</p>
        </div>
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500 group-focus-within:text-text-app transition-colors" />
            <input 
              type="text" 
              placeholder="Search reminders..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-card-app border border-border-app rounded-2xl py-2.5 lg:py-3 pl-11 lg:pl-12 pr-6 w-full lg:w-64 focus:outline-none focus:border-accent-blue/50 transition-all font-bold text-sm text-text-app"
            />
          </div>
          <button 
            onClick={onAddClick}
            className="p-3 bg-accent-blue text-black rounded-2xl shadow-lg shadow-blue-400/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            title="Add New Reminder"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-3">
                Upcoming
                <span className="bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full text-xs">{upcomingNotes.length}</span>
              </h3>
            </div>
            
            <div className="space-y-4">
              {upcomingNotes.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onNoteClick(note.id)}
                  className={cn(
                    "bg-card-app border border-border-app rounded-[1.5rem] p-5 lg:p-6 flex items-center justify-between hover:border-accent-blue/30 transition-all group cursor-pointer",
                    note.isCompleted && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(note.id);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        note.isCompleted ? "bg-accent-blue border-accent-blue text-black" : "border-border-app group-hover:border-accent-blue"
                      )}
                    >
                      {note.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <h4 className={cn("font-black text-sm lg:text-base", note.isCompleted && "line-through text-gray-500")}>
                        {note.content}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{note.category}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                        <div className="flex items-center gap-1.5 text-sticky-pink">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{note.reminderDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-600 hover:text-text-app transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
              {upcomingNotes.length === 0 && (
                <div className="py-20 text-center bg-card-app/30 border border-dashed border-border-app rounded-[2rem]">
                  <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No scheduled reminders</p>
                </div>
              )}
            </div>
          </section>

          {completedReminders.length > 0 && (
            <section>
              <h3 className="text-xl font-black mb-6 opacity-40">Completed Reminders</h3>
              <div className="space-y-4">
                {completedReminders.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => onNoteClick(note.id)}
                    className="bg-card-app/40 border border-border-app rounded-2xl p-4 flex items-center justify-between opacity-50 cursor-pointer hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-accent-blue w-4 h-4" />
                      <p className="font-bold text-sm text-gray-400 line-through">{note.content}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-600">{note.reminderDate}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calendar className="w-24 h-24" />
            </div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-black">{monthName}</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{currentYear}</span>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4 relative z-10 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-[10px] font-black text-gray-600 p-2">{d}</div>
              ))}
              
              {/* Empty slots for first week */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate();
                const hasRem = hasReminderOnDay(day);
                
                return (
                  <div 
                    key={day} 
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center text-[11px] font-black transition-all cursor-pointer relative group",
                      isToday ? "bg-accent-blue text-black shadow-lg shadow-blue-400/20" : "bg-text-app/5 text-gray-500 hover:bg-text-app/10"
                    )}
                  >
                    {day}
                    {hasRem && (
                      <div className={cn(
                        "w-1 h-1 rounded-full absolute bottom-1.5",
                        isToday ? "bg-black" : "bg-sticky-pink"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
            <button className="w-full relative z-10 mt-2 py-3 bg-text-app/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-text-app/10 transition-colors">
              Schedule Overview
            </button>
          </div>

          <div className="bg-sticky-pink/10 border border-sticky-pink/20 rounded-[2rem] p-8">
            <h3 className="text-xl font-black text-sticky-pink mb-2">Overdue</h3>
            <p className="text-xs font-bold text-sticky-pink/60 mb-6">You have {overdueNotes.length} tasks that need immediate attention.</p>
            <div className="space-y-4">
              {overdueNotes.slice(0, 2).map(note => (
                <div key={note.id} className="bg-black/20 rounded-2xl p-4">
                  <p className="text-xs font-black text-white line-clamp-1">{note.content}</p>
                  <p className="text-[10px] font-bold text-white/40 mt-1 uppercase">Due Yesterday</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
