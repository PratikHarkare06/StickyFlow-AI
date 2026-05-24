import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, CheckCircle2, 
  Clock, Target, Flame, Trophy, ArrowUp, ArrowDown, Minus 
} from 'lucide-react';
import { Note, cn } from '../types';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { parseISO, format, startOfWeek, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

interface AnalyticsDashboardProps {
  notes: Note[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Work: '#FACC15',
  Personal: '#EC4899',
  Ideas: '#3B82F6',
  Urgent: '#06B6D4',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ notes }) => {
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const total = notes.length;
    const completed = notes.filter(n => n.isCompleted).length;
    const archived = notes.filter(n => n.isArchived).length;
    const pinned = notes.filter(n => n.isPinned).length;
    const withReminder = notes.filter(n => n.reminderDate).length;
    const withSubtasks = notes.filter(n => (n.subtasks?.length || 0) > 0).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Notes created today
    const today = new Date();
    const todayNotes = notes.filter(n => isSameDay(parseISO(n.timestamp), today)).length;

    // Notes created yesterday
    const yesterday = subDays(today, 1);
    const yesterdayNotes = notes.filter(n => isSameDay(parseISO(n.timestamp), yesterday)).length;

    // Trend: today vs yesterday
    const trend = todayNotes > yesterdayNotes ? 'up' : todayNotes < yesterdayNotes ? 'down' : 'flat';

    // Streak (consecutive days with activity)
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = subDays(today, i);
      const hasActivity = notes.some(n => isSameDay(parseISO(n.timestamp), day));
      if (hasActivity) streak++;
      else break;
    }

    // Category breakdown
    const catMap: Record<string, number> = {};
    notes.forEach(n => { catMap[n.category] = (catMap[n.category] || 0) + 1; });
    const categoryData = Object.entries(catMap).map(([name, value]) => ({
      name, value, color: CATEGORY_COLORS[name] || '#8B5CF6'
    }));

    // Daily activity (last N days)
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dailyActivity = eachDayOfInterval({
      start: subDays(today, days - 1),
      end: today,
    }).map(day => ({
      date: format(day, range === '7d' ? 'EEE' : 'MMM d'),
      created: notes.filter(n => isSameDay(parseISO(n.timestamp), day)).length,
      completed: notes.filter(n => n.isCompleted && isSameDay(parseISO(n.timestamp), day)).length,
    }));

    // Productivity by hour
    const hourlyData = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      count: notes.filter(n => parseISO(n.timestamp).getHours() === h).length,
    }));
    const peakHour = hourlyData.reduce((a, b) => a.count > b.count ? a : b);

    // Avg note length
    const avgLength = total > 0 
      ? Math.round(notes.reduce((sum, n) => sum + (n.content.replace(/<[^>]*>/g, '').length), 0) / total) 
      : 0;

    return {
      total, completed, archived, pinned, withReminder, withSubtasks,
      completionRate, todayNotes, trend, streak, categoryData,
      dailyActivity, hourlyData, peakHour, avgLength
    };
  }, [notes, range]);

  const StatCard = ({ label, value, icon: Icon, color, sub }: any) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-card-app border border-border-app rounded-3xl p-6 shadow-lg space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-3xl font-black tabular-nums">{value}</p>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
        {sub && <p className="text-[9px] font-bold text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-32 overflow-x-hidden mt-14 lg:mt-0">
      <header className="lg:pr-[360px]">
        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Analytics</h2>
        <p className="text-gray-400 font-bold text-sm">Deep insights into your productivity patterns</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Notes"
          value={stats.total}
          icon={BarChart3}
          color="bg-accent-blue/10 text-accent-blue"
          sub={`${stats.todayNotes} today ${stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}`}
        />
        <StatCard
          label="Completion"
          value={`${stats.completionRate}%`}
          icon={Target}
          color="bg-emerald-500/10 text-emerald-400"
          sub={`${stats.completed} out of ${stats.total}`}
        />
        <StatCard
          label="Day Streak"
          value={stats.streak}
          icon={Flame}
          color="bg-orange-500/10 text-orange-400"
          sub="Consecutive active days"
        />
        <StatCard
          label="Avg. Length"
          value={stats.avgLength}
          icon={TrendingUp}
          color="bg-violet-500/10 text-violet-400"
          sub="Characters per note"
        />
      </div>

      {/* Activity Trend Chart */}
      <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black">Activity Trend</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Notes created & completed over time</p>
          </div>
          <div className="flex gap-1 bg-text-app/5 rounded-xl p-1">
            {(['7d', '30d', 'all'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  range === r ? 'bg-accent-blue text-black shadow-lg' : 'text-gray-500 hover:text-text-app'
                )}
              >
                {r === 'all' ? '90d' : r}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyActivity}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A5C9FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A5C9FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 700 }} 
                  axisLine={false} 
                  tickLine={false}
                  interval={range === '30d' ? 4 : range === 'all' ? 10 : 0}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card-app)', 
                    border: '1px solid var(--border-app)', 
                    borderRadius: '1rem',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                />
                <Area type="monotone" dataKey="created" stroke="#A5C9FF" strokeWidth={2.5} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-text-app/5 rounded-[1.5rem] animate-pulse" />
          )}
        </div>
        <div className="flex gap-6 mt-4">
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span className="w-3 h-1 bg-accent-blue rounded-full" /> Created
          </span>
          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" /> Completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-lg font-black mb-6">Category Breakdown</h3>
          {stats.categoryData.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-40 h-40">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryData}
                        cx="50%" cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full bg-text-app/5 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                {stats.categoryData.map(cat => {
                  const pct = stats.total > 0 ? Math.round((cat.value / stats.total) * 100) : 0;
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-xs font-bold text-text-app flex-1">{cat.name}</span>
                      <span className="text-xs font-black text-gray-500">{cat.value}</span>
                      <div className="w-16 h-1.5 bg-text-app/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 font-bold text-sm text-center py-10">No data yet</p>
          )}
        </div>

        {/* Peak Productivity */}
        <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-lg font-black mb-2">Peak Productivity</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">
            Your most productive hour: <span className="text-accent-blue">{stats.peakHour.hour}</span> ({stats.peakHour.count} notes)
          </p>
          <div className="h-36">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.hourlyData}>
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.hourlyData.map((entry, i) => (
                      <Cell 
                        key={i} 
                        fill={entry.hour === stats.peakHour.hour ? '#A5C9FF' : 'rgba(255,255,255,0.07)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-text-app/5 rounded-[1rem] animate-pulse" />
            )}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] font-bold text-gray-600">12am</span>
            <span className="text-[9px] font-bold text-gray-600">6am</span>
            <span className="text-[9px] font-bold text-gray-600">12pm</span>
            <span className="text-[9px] font-bold text-gray-600">6pm</span>
            <span className="text-[9px] font-bold text-gray-600">12am</span>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pinned" value={stats.pinned} icon={Trophy} color="bg-sticky-yellow/10 text-sticky-yellow" />
        <StatCard label="Archived" value={stats.archived} icon={Calendar} color="bg-gray-500/10 text-gray-400" />
        <StatCard label="With Reminders" value={stats.withReminder} icon={Clock} color="bg-sticky-pink/10 text-sticky-pink" />
        <StatCard label="Has Subtasks" value={stats.withSubtasks} icon={CheckCircle2} color="bg-cyan-500/10 text-cyan-400" />
      </div>
    </div>
  );
};
