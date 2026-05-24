import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Repeat, Calendar, X, Check, Clock, Bell, ChevronDown } from 'lucide-react';
import { cn } from '../types';
import { addDays, addWeeks, addMonths, format, parseISO, isAfter } from 'date-fns';

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly';

export interface RecurrenceConfig {
  type: RecurrenceType;
  endDate?: string; // optional end date
}

// ── Get next occurrence from a base date ────────────────────────────────────
export const getNextOccurrence = (baseDate: string, recurrence: RecurrenceType): string => {
  const base = parseISO(baseDate);
  const now = new Date();

  switch (recurrence) {
    case 'daily':
      return addDays(now > base ? now : base, 1).toISOString().split('T')[0];
    case 'weekdays': {
      let next = addDays(now > base ? now : base, 1);
      while (next.getDay() === 0 || next.getDay() === 6) {
        next = addDays(next, 1);
      }
      return next.toISOString().split('T')[0];
    }
    case 'weekly':
      return addWeeks(now > base ? now : base, 1).toISOString().split('T')[0];
    case 'biweekly':
      return addWeeks(now > base ? now : base, 2).toISOString().split('T')[0];
    case 'monthly':
      return addMonths(now > base ? now : base, 1).toISOString().split('T')[0];
    default:
      return baseDate;
  }
};

// ── Process recurring reminders: auto-advance past reminders ────────────────
export const processRecurringReminder = (
  reminderDate: string,
  recurrence: RecurrenceConfig
): string | undefined => {
  if (recurrence.type === 'none') return undefined;
  
  const nextDate = getNextOccurrence(reminderDate, recurrence.type);
  
  // Check if recurrence has ended
  if (recurrence.endDate && isAfter(parseISO(nextDate), parseISO(recurrence.endDate))) {
    return undefined;
  }
  
  return nextDate;
};

// ── Recurrence labels ────────────────────────────────────────────────────────
const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string; desc: string }[] = [
  { value: 'none', label: 'No Repeat', desc: "One-time reminder" },
  { value: 'daily', label: 'Daily', desc: 'Every day' },
  { value: 'weekdays', label: 'Weekdays', desc: 'Mon – Fri' },
  { value: 'weekly', label: 'Weekly', desc: 'Same day each week' },
  { value: 'biweekly', label: 'Bi-weekly', desc: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly', desc: 'Same date each month' },
];

export const getRecurrenceLabel = (type: RecurrenceType): string => {
  return RECURRENCE_OPTIONS.find(o => o.value === type)?.label || 'No Repeat';
};

// ── Recurrence Picker UI ────────────────────────────────────────────────────
interface RecurrencePickerProps {
  value: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
  reminderDate?: string;
  compact?: boolean;
}

export const RecurrencePicker: React.FC<RecurrencePickerProps> = ({ value, onChange, reminderDate, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const nextOccurrenceLabel = useMemo(() => {
    if (value.type === 'none' || !reminderDate) return null;
    const next = getNextOccurrence(reminderDate, value.type);
    try {
      return format(parseISO(next), 'MMM d, yyyy');
    } catch {
      return next;
    }
  }, [value.type, reminderDate]);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(o => !o)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
            value.type !== 'none'
              ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
              : "border-border-app text-gray-600 hover:border-violet-500/30 hover:text-violet-400"
          )}
        >
          <Repeat className="w-3 h-3" />
          {getRecurrenceLabel(value.type)}
          <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              className="absolute top-full left-0 mt-2 bg-card-app border border-border-app rounded-2xl shadow-2xl z-50 w-[220px] p-2"
            >
              {RECURRENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange({ ...value, type: opt.value });
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors",
                    value.type === opt.value ? "bg-violet-500/10 text-violet-400" : "text-gray-500 hover:bg-text-app/5"
                  )}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{opt.label}</p>
                    <p className="text-[8px] font-bold text-gray-600 mt-0.5">{opt.desc}</p>
                  </div>
                  {value.type === opt.value && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              ))}

              {value.type !== 'none' && (
                <div className="mt-2 pt-2 border-t border-border-app px-3 pb-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1.5">End Date (optional)</p>
                  <input
                    type="date"
                    value={value.endDate || ''}
                    onChange={(e) => onChange({ ...value, endDate: e.target.value || undefined })}
                    className="w-full bg-text-app/5 border border-border-app rounded-lg px-2 py-1.5 text-[10px] font-bold text-text-app focus:outline-none focus:border-violet-500/40"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-gray-500" />
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Repeat</h4>
        </div>
        {nextOccurrenceLabel && (
          <span className="text-[9px] font-bold text-violet-400">Next: {nextOccurrenceLabel}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {RECURRENCE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...value, type: opt.value })}
            className={cn(
              "p-2.5 rounded-xl border text-center transition-all",
              value.type === opt.value
                ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                : "border-border-app text-gray-600 hover:border-violet-500/30"
            )}
          >
            <p className="text-[9px] font-black uppercase tracking-widest">{opt.label}</p>
          </button>
        ))}
      </div>

      {value.type !== 'none' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-violet-500/5 border border-violet-500/20">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-bold text-violet-400">
              Repeats {getRecurrenceLabel(value.type).toLowerCase()}
              {nextOccurrenceLabel && ` · Next: ${nextOccurrenceLabel}`}
            </span>
          </div>

          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">End Date (optional)</p>
            <input
              type="date"
              value={value.endDate || ''}
              onChange={(e) => onChange({ ...value, endDate: e.target.value || undefined })}
              className="w-full bg-text-app/5 border border-border-app rounded-xl px-3 py-2 text-[10px] font-bold text-text-app focus:outline-none focus:border-violet-500/40"
            />
          </div>
        </div>
      )}
    </div>
  );
};
