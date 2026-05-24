import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Coffee, Brain } from 'lucide-react';

type TimerMode = 'focus' | 'break';

const TIMES: Record<TimerMode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
};

export const PomodoroTimer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = React.useState<TimerMode>('focus');
  const [seconds, setSeconds] = React.useState(TIMES.focus);
  const [running, setRunning] = React.useState(false);
  const [sessions, setSessions] = React.useState(0);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const total = TIMES[mode];
  const progress = (total - seconds) / total;

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            // Notify
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(mode === 'focus' ? '🎉 Focus session done! Take a break.' : '🚀 Break over! Back to focus.');
            }
            // Switch mode
            const nextMode: TimerMode = mode === 'focus' ? 'break' : 'focus';
            if (mode === 'focus') setSessions(n => n + 1);
            setMode(nextMode);
            setSeconds(TIMES[nextMode]);
            return TIMES[nextMode];
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setSeconds(TIMES[mode]);
  };

  const switchMode = (m: TimerMode) => {
    setRunning(false);
    setMode(m);
    setSeconds(TIMES[m]);
  };

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  // SVG circle
  const R = 54;
  const circ = 2 * Math.PI * R;
  const dash = circ * progress;

  const modeColor = mode === 'focus' ? '#A5C9FF' : '#10B981';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 16 }}
      drag
      dragMomentum={false}
      className="fixed bottom-24 right-6 z-[200] w-64 bg-card-app border border-border-app rounded-3xl shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex gap-1">
          <button
            onClick={() => switchMode('focus')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'focus' ? 'bg-accent-blue text-black' : 'text-gray-500 hover:text-text-app'}`}
          >
            <Brain className="w-3 h-3 inline mr-1" />Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'break' ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-text-app'}`}
          >
            <Coffee className="w-3 h-3 inline mr-1" />Break
          </button>
        </div>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center py-4">
        <div className="relative w-34 h-34" style={{ width: 136, height: 136 }}>
          <svg width="136" height="136" className="-rotate-90">
            {/* Track */}
            <circle
              cx="68" cy="68" r={R}
              fill="none" stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            {/* Progress */}
            <circle
              cx="68" cy="68" r={R}
              fill="none"
              stroke={modeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tabular-nums text-text-app">
              {mins}:{secs}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {mode === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pb-4">
        <button
          onClick={reset}
          className="p-2.5 rounded-xl bg-text-app/5 text-gray-500 hover:text-text-app hover:bg-text-app/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRunning(r => !r)}
          className="px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center gap-2 shadow-lg"
          style={{
            background: modeColor,
            color: '#000',
            boxShadow: `0 8px 24px -4px ${modeColor}40`
          }}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? 'Pause' : 'Start'}
        </button>
      </div>

      {/* Sessions */}
      {sessions > 0 && (
        <div className="flex justify-center gap-1 pb-4">
          {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-accent-blue opacity-70" />
          ))}
          {sessions > 8 && <span className="text-[9px] font-black text-gray-600">+{sessions - 8}</span>}
        </div>
      )}
    </motion.div>
  );
};
