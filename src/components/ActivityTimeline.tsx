import React from 'react';
import { motion } from 'motion/react';
import { Activity as ActivityIcon, PlusCircle, Edit3, CheckCircle, Share2, Paperclip, Clock } from 'lucide-react';
import { Activity, cn } from '../types';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ICONS = {
  created: <PlusCircle className="w-3.5 h-3.5" />,
  edited: <Edit3 className="w-3.5 h-3.5" />,
  status_change: <CheckCircle className="w-3.5 h-3.5" />,
  shared: <Share2 className="w-1.5 h-1.5" />, // Minor icon
  attachment_added: <Paperclip className="w-3.5 h-3.5" />,
};

const COLORS = {
  created: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  edited: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  status_change: 'bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/20',
  shared: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  attachment_added: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
      <ActivityIcon className="w-8 h-8 mb-3" />
      <p className="text-[10px] font-black uppercase tracking-widest">No activities recorded yet</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Activity Timeline</h3>
        <ActivityIcon className="w-4 h-4 text-gray-700" />
      </div>

      <div className="relative space-y-5 pl-8">
        {/* Track Line */}
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border-app group" />

        {activities.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative"
          >
            {/* Dot */}
            <div className={cn(
              "absolute -left-8 w-7 h-7 rounded-xl border flex items-center justify-center z-10 shadow-sm transition-transform hover:scale-110",
              COLORS[item.type as keyof typeof COLORS] || COLORS.edited
            )}>
              {ICONS[item.type as keyof typeof ICONS] || <Edit3 className="w-3.5 h-3.5" />}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-text-app capitalize tracking-tight">
                  {item.type.replace('_', ' ')}
                </span>
                <span className="text-[9px] font-bold text-gray-600 flex items-center gap-1 uppercase tracking-widest">
                  <Clock className="w-2.5 h-2.5" />
                  {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-bold leading-tight">
                {item.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
