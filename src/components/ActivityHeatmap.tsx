import React from 'react';
import { motion } from 'motion/react';
import { Note } from '../types';

interface ActivityHeatmapProps {
  notes: Note[];
}

// Build a 16-week heatmap (16 cols × 7 rows)
const WEEKS = 16;
const DAYS = 7;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildHeatmap(notes: Note[]) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Map from "YYYY-MM-DD" → count
  const countMap: Record<string, number> = {};
  notes.forEach(n => {
    const d = n.timestamp.slice(0, 10);
    countMap[d] = (countMap[d] || 0) + 1;
  });

  // Build grid: [week][day]
  const grid: { date: Date; count: number; dateStr: string }[][] = [];
  // Start from (WEEKS * 7) days ago, aligned to Sunday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - WEEKS * DAYS + 1);
  // Align to Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  let current = new Date(startDate);
  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < DAYS; d++) {
      const dateStr = current.toISOString().slice(0, 10);
      week.push({ date: new Date(current), count: countMap[dateStr] || 0, dateStr });
      current.setDate(current.getDate() + 1);
    }
    grid.push(week);
  }

  const max = Math.max(1, ...Object.values(countMap));
  return { grid, max };
}

function getColor(count: number, max: number): string {
  if (count === 0) return '';
  const intensity = count / max;
  if (intensity < 0.25) return 'bg-accent-blue/20';
  if (intensity < 0.5)  return 'bg-accent-blue/40';
  if (intensity < 0.75) return 'bg-accent-blue/65';
  return 'bg-accent-blue';
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ notes }) => {
  const { grid, max } = buildHeatmap(notes);
  const today = new Date().toISOString().slice(0, 10);
  const [tooltip, setTooltip] = React.useState<{ text: string; x: number; y: number } | null>(null);

  // Month labels: find where each new month starts
  const monthLabels: { label: string; col: number }[] = [];
  grid.forEach((week, wi) => {
    const firstDay = week[0].date;
    if (wi === 0 || firstDay.getDate() <= 7) {
      const prev = wi > 0 ? grid[wi - 1][0].date.getMonth() : -1;
      if (firstDay.getMonth() !== prev) {
        monthLabels.push({ label: MONTH_SHORT[firstDay.getMonth()], col: wi });
      }
    }
  });

  return (
    <div className="bg-card-app border border-border-app rounded-[2rem] p-6 lg:p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-black text-text-app">Activity</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Note creation over 16 weeks</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
          Less
          {['bg-text-app/10', 'bg-accent-blue/20', 'bg-accent-blue/40', 'bg-accent-blue/65', 'bg-accent-blue'].map(c => (
            <span key={c} className={`w-3 h-3 rounded-[3px] ${c}`} />
          ))}
          More
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {grid.map((week, wi) => {
              const m = monthLabels.find(ml => ml.col === wi);
              return (
                <div key={wi} className="w-[13px] mr-[3px] text-[9px] font-bold text-gray-600 shrink-0">
                  {m ? m.label : ''}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2">
              {DAY_LABELS.map((d, i) => (
                <div key={d} className="h-[13px] text-[9px] font-bold text-gray-600 leading-none flex items-center">
                  {i % 2 === 1 ? d.slice(0, 1) : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px] mr-[3px]">
                {week.map((cell, di) => {
                  const isToday = cell.dateStr === today;
                  const isFuture = cell.date > new Date();
                  return (
                    <motion.div
                      key={di}
                      whileHover={{ scale: 1.4 }}
                      onMouseEnter={e => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        const label = cell.count === 0
                          ? `No activity on ${cell.dateStr}`
                          : `${cell.count} note${cell.count !== 1 ? 's' : ''} on ${cell.dateStr}`;
                        setTooltip({ text: label, x: rect.left + 6, y: rect.top - 32 });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className={[
                        'w-[13px] h-[13px] rounded-[3px] cursor-default transition-colors',
                        isFuture ? 'opacity-0' : '',
                        cell.count > 0 ? getColor(cell.count, max) : 'bg-text-app/8',
                        isToday ? 'ring-2 ring-accent-blue ring-offset-1 ring-offset-card-app' : '',
                      ].join(' ')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 bg-card-app border border-border-app rounded-xl text-[11px] font-bold text-text-app shadow-xl pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
