import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Tag, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { getSharedNote, SharedNote } from '../utils/shareNote';
import { STICKY_COLORS, cn } from '../types';

interface SharedNoteViewProps {
  shareId: string;
  onClose: () => void;
}

export const SharedNoteView: React.FC<SharedNoteViewProps> = ({ shareId, onClose }) => {
  const [data, setData] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const note = await getSharedNote(shareId);
        if (note) {
          setData(note);
        } else {
          setError('Link expired or note not found');
        }
      } catch (e) {
        setError('Failed to load shared note');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [shareId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin" />
          <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Fetching Secret Note...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card-app border border-border-app p-10 rounded-[2.5rem] max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-sticky-pink/10 border border-sticky-pink/30 rounded-3xl flex items-center justify-center mx-auto text-sticky-pink">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Oops! Dead Link</h2>
          <p className="text-gray-500 font-bold leading-relaxed">
            {error || 'This note is no longer available. Shared links expire after 7 days.'}
          </p>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-text-app/5 hover:bg-text-app/10 text-gray-400 font-black rounded-2xl transition-all"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const colorClass = STICKY_COLORS[data.color as keyof typeof STICKY_COLORS] || STICKY_COLORS.yellow;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-3xl w-full"
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue flex items-center justify-center text-black">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue">Public Share</p>
              <h1 className="text-white font-black text-sm tracking-tight">Sticky Snapshot</h1>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-11 h-11 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl flex items-center justify-center transition-all border border-white/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Note Content */}
        <div className={cn(
          "rounded-[3rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col",
          colorClass
        )}>
          {/* Subtle noise/texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-10">
              <span className="px-4 py-1.5 bg-black/10 border border-black/10 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-current opacity-80">
                <Tag className="w-3.5 h-3.5" />
                {data.category}
              </span>
              <span className="px-4 py-1.5 bg-white/20 border border-white/20 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-current opacity-70">
                <Clock className="w-3.5 h-3.5" />
                Expiring Soon
              </span>
            </div>

            <div 
              className="prose prose-lg max-w-none text-current opacity-90 font-bold leading-relaxed flex-1 select-text"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />

            <div className="mt-14 pt-8 border-t border-black/5 flex flex-col lg:flex-row justify-between items-center gap-6">
              <p className="text-xs font-black text-current opacity-50 uppercase tracking-widest">
                Generated by StickyFlow App
              </p>
              <button 
                onClick={() => window.open(window.location.origin)}
                className="px-8 py-3.5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20"
              >
                Create your own Flow
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
