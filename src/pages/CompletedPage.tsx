import React from 'react';
import { Search, Bell, MoreVertical, Clock } from 'lucide-react';
import { 
  XAxis, 
  ResponsiveContainer, 
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { Note, STICKY_COLORS, cn } from '../types';
import { motion } from 'motion/react';

const activityData = [
  { name: 'Mon', value: 30 },
  { name: 'Tue', value: 45 },
  { name: 'Wed', value: 38 },
  { name: 'Thu', value: 62 },
  { name: 'Fri', value: 55 },
  { name: 'Sat', value: 78 },
  { name: 'Sun', value: 92 },
];

const COMPLETED_NOTES: Note[] = [
  { id: 'c1', content: '', category: 'Project Alpha', color: 'yellow', timestamp: 'Oct 12', isPinned: false, isCompleted: true, isArchived: false },
  { id: 'c2', content: '', category: 'Personal', color: 'blue', timestamp: 'Oct 11', isPinned: false, isCompleted: true, isArchived: false },
  { id: 'c3', content: '', category: 'Design', color: 'pink', timestamp: 'Oct 10', isPinned: false, isCompleted: true, isArchived: false },
  { id: 'c4', content: '', category: 'Ideas', color: 'green', timestamp: 'Oct 09', isPinned: false, isCompleted: true, isArchived: false },
  { id: 'c5', content: '', category: 'Work', color: 'purple', timestamp: 'Oct 08', isPinned: false, isCompleted: true, isArchived: false },
  { id: 'c6', content: '', category: 'Finance', color: 'yellow', timestamp: 'Oct 07', isPinned: false, isCompleted: true, isArchived: false },
  { id: 'c7', content: '', category: 'Meeting', color: 'pink', timestamp: 'Oct 06', isPinned: false, isCompleted: true, isArchived: false },
  { id: 'c8', content: '', category: 'Learning', color: 'blue', timestamp: 'Oct 05', isPinned: false, isCompleted: true, isArchived: false },
];

interface CompletedPageProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onRestoreNote: (id: string) => void;
  onClearHistory: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewChange: (view: any) => void;
}

export const CompletedPage: React.FC<CompletedPageProps> = ({ 
  notes, 
  onDeleteNote, 
  onRestoreNote,
  onClearHistory,
  searchQuery,
  onSearchChange,
  onViewChange
}) => {
  const completedCount = notes.length;
  const velocity = 84; 
  
  return (
    <div className="space-y-6 lg:space-y-10 pb-32 overflow-x-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mt-14 lg:mt-0 lg:pr-[360px]">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-1">Success History</h2>
          <p className="text-gray-500 font-bold text-xs lg:text-sm">Review your productivity and celebrate your completed tasks.</p>
        </div>
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500 group-focus-within:text-text-app transition-colors" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-card-app border border-border-app rounded-2xl py-2.5 lg:py-3 pl-11 lg:pl-12 pr-6 w-full lg:w-64 focus:outline-none focus:border-accent-blue/50 transition-all font-bold text-sm text-text-app"
            />
          </div>
          <button 
            onClick={() => onViewChange('settings')}
            className="p-2.5 lg:p-3 bg-card-app border border-border-app rounded-2xl hover:bg-black/5 transition-colors relative group"
          >
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-text-app transition-colors" />
            <span className="absolute top-2.5 right-2.5 lg:top-3 lg:right-3 w-2 h-2 bg-sticky-pink rounded-full border-2 border-bg-app" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
        <div className="bg-card-app border border-border-app rounded-[1.5rem] p-6 lg:p-8 shadow-xl">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tasks Completed</p>
          <p className="text-4xl font-black tracking-tighter text-text-app">{completedCount}</p>
        </div>
        <div className="bg-card-app border border-border-app rounded-[1.5rem] p-6 lg:p-8 shadow-xl">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Completion Velocity</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black tracking-tighter text-text-app">{velocity}%</p>
            <span className="bg-accent-blue/10 text-accent-blue px-2.5 py-1 rounded-lg text-[10px] font-black mb-1">+12%</span>
          </div>
        </div>
        <div className="bg-card-app border border-border-app rounded-[1.5rem] p-6 lg:p-8 shadow-xl">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Productivity Score</p>
          <p className="text-4xl font-black tracking-tighter text-text-app">{completedCount * 12}</p>
        </div>
      </div>

      <section className="bg-card-app border border-border-app rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <h3 className="text-xl lg:text-2xl font-black">Completion Activity</h3>
          <select className="bg-text-app/5 border border-border-app rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent-blue/50 text-text-app">
            <option className="bg-card-app">Last 7 Days</option>
            <option className="bg-card-app">Last 30 Days</option>
          </select>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A5C9FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#A5C9FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 900 }}
                dy={15}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card-app)', border: '1px solid var(--border-app)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: 'var(--text-app)', fontWeight: 900 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#A5C9FF" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ fill: '#fff', strokeWidth: 0, r: 6 }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-xl font-black tracking-tight">Recently Completed</h3>
          <button 
            onClick={onClearHistory}
            className="text-[10px] font-black text-sticky-pink hover:text-text-app transition-colors uppercase tracking-widest"
          >
            Clear All History
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {notes.map(note => (
            <motion.div
              key={note.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className={cn(
                "p-3.5 lg:p-4.5 rounded-[1.25rem] lg:rounded-[1.5rem] aspect-square flex flex-col justify-between shadow-xl cursor-pointer transition-all relative group",
                STICKY_COLORS[note.color as keyof typeof STICKY_COLORS]
              )}
            >
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full bg-black/10 text-[7px] lg:text-[8px] font-black uppercase tracking-widest">
                  {note.category}
                </span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onRestoreNote(note.id)}
                    className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm lg:text-base font-black leading-tight line-clamp-4 opacity-60 line-through decoration-2 mt-2 lg:mt-3">
                {note.content}
              </p>

              <div className="flex justify-between items-end mt-4">
                <div className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                  {note.timestamp}
                </div>
                <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center shadow-inner">
                  <Clock className="w-5 h-5 opacity-40" />
                </div>
              </div>
            </motion.div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full py-16 text-center bg-text-app/5 border border-dashed border-border-app rounded-[1.5rem] lg:rounded-[2rem]">
              <p className="text-gray-500 font-black uppercase tracking-widest">No completed notes found</p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Restore Button */}
      <button 
        className="fixed bottom-10 right-10 bg-accent-blue text-black px-6 py-4 rounded-full font-bold flex items-center gap-2.5 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-110 active:scale-95 transition-all z-50 text-sm"
      >
        <Clock className="w-5 h-5 stroke-[3px]" />
        Restore Recent
      </button>
    </div>
  );
};
