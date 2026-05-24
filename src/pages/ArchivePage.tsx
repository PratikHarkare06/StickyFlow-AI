import React from 'react';
import { Search, Bell, MoreVertical, Archive, Clock, RefreshCw } from 'lucide-react';
import { Note, STICKY_COLORS, cn } from '../types';
import { motion } from 'motion/react';

interface ArchivePageProps {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onArchiveAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewChange: (view: any) => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({ 
  notes, 
  onDeleteNote, 
  onToggleArchive,
  onArchiveAll,
  searchQuery,
  onSearchChange,
  onViewChange
}) => {
  const archivedNotes = notes.filter(n => n.isArchived);
  const storageUsedPcnt = Math.min(Math.round((notes.length / 100) * 100), 100);

  return (
    <div className="space-y-6 lg:space-y-10 pb-32 overflow-x-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mt-14 lg:mt-0 lg:pr-[360px]">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-1">Vault Archive</h2>
          <p className="text-gray-500 font-bold text-xs lg:text-sm">Long-term storage for your finished flows and deep thoughts.</p>
        </div>
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500 group-focus-within:text-text-app transition-colors" />
            <input 
              type="text" 
              placeholder="Search archive..." 
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
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        <div className="bg-card-app border border-border-app rounded-[1.5rem] p-6 lg:p-8 shadow-xl flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shadow-inner">
            <Archive className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Archived</p>
            <p className="text-3xl font-black tracking-tighter text-text-app">{archivedNotes.length}</p>
          </div>
        </div>
        <div className="bg-card-app border border-border-app rounded-[1.5rem] p-6 lg:p-8 shadow-xl flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-sticky-pink/10 flex items-center justify-center text-sticky-pink shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Storage Used</p>
            <p className="text-3xl font-black tracking-tighter text-text-app">{storageUsedPcnt}%</p>
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-xl font-black tracking-tight">Archived Flows</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
          {archivedNotes.map(note => (
            <motion.div
              key={note.id}
              whileHover={{ y: -8, scale: 1.02 }}
              className={cn(
                "p-3.5 lg:p-4.5 rounded-[1.25rem] lg:rounded-[1.5rem] aspect-square flex flex-col justify-between shadow-xl cursor-pointer transition-all relative group overflow-hidden",
                STICKY_COLORS[note.color as keyof typeof STICKY_COLORS]
              )}
            >
              <div className="absolute inset-0 bg-black/10 opacity-40" />
              
              <div className="relative z-10 flex justify-between items-start">
                <span className="px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-full bg-black/20 text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-current opacity-80">
                  {note.category}
                </span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive(note.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-black/20 transition-colors text-current"
                    title="Unarchive"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-black/20 transition-colors text-current"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="relative z-10 text-sm lg:text-base font-bold leading-tight line-clamp-4 mt-2 lg:mt-3 text-current opacity-70 italic">
                {note.content}
              </p>

              <div className="relative z-10 flex justify-between items-end mt-4">
                <div className="text-[10px] font-black opacity-50 uppercase tracking-widest text-current">
                  {note.timestamp}
                </div>
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shadow-inner">
                  <Archive className="w-5 h-5 text-white/50" />
                </div>
              </div>
            </motion.div>
          ))}
          {notes.length === 0 && (
            <div className="col-span-full py-24 text-center bg-card-app/50 border border-dashed border-border-app rounded-[2rem] lg:rounded-[3rem] flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-text-app/5 flex items-center justify-center text-gray-500">
                <Archive className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Your vault is empty</p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Archive All Button */}
      <button 
        onClick={onArchiveAll}
        className="fixed bottom-10 right-10 bg-accent-blue text-black px-6 py-4 rounded-full font-bold flex items-center justify-center gap-2.5 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-110 active:scale-95 transition-all z-50 text-sm whitespace-nowrap"
      >
        <Archive className="w-5 h-5 stroke-[3px]" />
        Clean Workspace
      </button>
    </div>
  );
};
