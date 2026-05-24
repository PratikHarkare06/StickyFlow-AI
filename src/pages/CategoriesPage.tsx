import React from 'react';
import { Search, Plus, MoreVertical, Bell, Edit3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '../types';

const categories = [
  { name: 'Design Sprint', tasks: 12, progress: 65, color: '#2196F3' },
  { name: 'Marketing', tasks: 8, progress: 40, color: '#E91E63' },
  { name: 'Development', tasks: 24, progress: 85, color: '#FFEB3B' },
  { name: 'Personal', tasks: 5, progress: 20, color: '#00E676' },
];

const activityData = [
  { name: 'M', value: 30 },
  { name: 'T', value: 55 },
  { name: 'W', value: 45 },
  { name: 'T', value: 75 },
  { name: 'F', value: 60 },
  { name: 'S', value: 85 },
  { name: 'S', value: 40 },
];

const distributionData = [
  { name: 'Design', value: 400, color: '#A5D5FF' },
  { name: 'Dev', value: 300, color: '#2196F3' },
  { name: 'Mark', value: 200, color: '#E91E63' },
  { name: 'Other', value: 100, color: '#6B7280' },
];

interface CategoriesPageProps {
  notes: Note[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onViewChange: (view: any) => void;
  onNoteClick: (id: string) => void;
}

import { Note } from '../types';

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ 
  notes, 
  searchQuery, 
  onSearchChange,
  onAddClick,
  onViewChange,
  onNoteClick
}) => {
  const getCategoryStats = (name: string, color: string) => {
    const catNotes = notes.filter(n => n.category === name && !n.isArchived);
    const completed = catNotes.filter(n => n.isCompleted).length;
    const progress = catNotes.length > 0 ? Math.round((completed / catNotes.length) * 100) : 0;
    return { name, tasks: catNotes.length, progress, color };
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  const activeCategories = [
    getCategoryStats('Work', '#FACC15'),
    getCategoryStats('Personal', '#EC4899'),
    getCategoryStats('Ideas', '#3B82F6'),
    getCategoryStats('Urgent', '#10B981'),
  ];

  const distribution = [
    { name: 'Work', value: notes.filter(n => n.category === 'Work' && !n.isArchived).length, color: '#FACC15' },
    { name: 'Personal', value: notes.filter(n => n.category === 'Personal' && !n.isArchived).length, color: '#EC4899' },
    { name: 'Ideas', value: notes.filter(n => n.category === 'Ideas' && !n.isArchived).length, color: '#3B82F6' },
    { name: 'Urgent', value: notes.filter(n => n.category === 'Urgent' && !n.isArchived).length, color: '#10B981' },
  ].filter(d => d.value > 0);

  const latestThinking = notes.filter(n => !n.isArchived).slice(0, 3);

  return (
    <div className="space-y-6 lg:space-y-10 pb-12 overflow-x-hidden">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mt-14 lg:mt-0 lg:pr-[360px]">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-1">Task Categories</h2>
          <p className="text-gray-500 font-bold text-xs lg:text-sm">Organize your workflow into specialized creative clusters.</p>
        </div>
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500 group-focus-within:text-text-app transition-colors" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-card-app border border-border-app rounded-2xl py-2.5 lg:py-3 pl-11 lg:pl-12 pr-6 w-full lg:w-48 xl:w-64 focus:outline-none focus:border-accent-blue/50 transition-all font-bold text-sm text-text-app"
            />
          </div>
          <button 
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 bg-accent-blue text-black px-5 lg:px-6 py-2.5 lg:py-3 rounded-2xl font-black text-xs lg:text-sm shadow-xl shadow-blue-400/10 hover:scale-105 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Create New
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {activeCategories.map((cat) => (
          <div key={cat.name} className="bg-card-app border border-border-app rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-7 space-y-5 lg:space-y-7 shadow-xl hover:border-text-app/10 transition-colors group cursor-pointer relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-black font-black text-xs lg:text-sm group-hover:rotate-12 transition-transform shadow-lg"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name[0]}
              </div>
              <button className="p-1 px-2 rounded-lg hover:bg-black/5 text-gray-500 hover:text-text-app transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="relative z-10">
              <h4 className="text-base lg:text-[1.3rem] font-black mb-1 text-text-app">{cat.name}</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{cat.tasks} tasks total</p>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-600">Progress</span>
                <span style={{ color: cat.color }}>{cat.progress}%</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                  style={{ width: `${cat.progress}%`, backgroundColor: cat.color }} 
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <section className="lg:col-span-2 bg-card-app border border-border-app rounded-[2rem] p-8 lg:p-10 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl lg:text-2xl font-black">Activity Overview</h3>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-accent-blue rounded-full" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Successful Flow</span>
            </div>
          </div>
          <div className="w-full h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 900 }}
                  dy={15}
                />
                <Bar dataKey="value" fill="#E2E8F0" radius={[8, 8, 8, 8]}>
                  {activityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 3 || index === 5 ? '#A5C9FF' : '#E2E8F0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-card-app border border-border-app rounded-[2rem] p-8 lg:p-10 flex flex-col items-center shadow-xl">
          <h3 className="text-xl lg:text-2xl font-black mb-8 w-full">Task Distribution</h3>
          <div className="relative w-full aspect-square max-w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution.length > 0 ? distribution : [{ value: 1, color: '#E2E8F0' }]}
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                  {distribution.length === 0 && <Cell fill="#E2E8F0" stroke="none" />}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">Total</p>
              <p className="text-4xl font-black tracking-tighter text-text-app">{notes.length || 0}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="pb-8">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-xl lg:text-2xl font-black tracking-tight">Latest Thinking</h3>
          <button onClick={() => onViewChange('dashboard')} className="text-[10px] font-black text-gray-500 hover:text-text-app transition-colors uppercase tracking-widest">View All</button>
        </div>
        <div className="space-y-4 text-left">
          {latestThinking.map((note) => (
            <div 
              key={note.id} 
              onClick={() => onNoteClick(note.id)}
              className="bg-card-app border border-border-app rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 group hover:border-text-app/10 hover:bg-black/5 transition-all cursor-pointer shadow-lg relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-3" style={{ backgroundColor: 
                note.category === 'Work' ? '#FACC15' : 
                note.category === 'Personal' ? '#EC4899' : 
                note.category === 'Ideas' ? '#3B82F6' : '#10B981'
              }} />
              <div className="flex-1">
                <h4 className="text-xl font-black mb-1 group-hover:text-accent-blue transition-colors text-text-app line-clamp-1">{stripHtml(note.content)}</h4>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{note.category}</p>
              </div>
              <div className="flex items-center gap-10 w-full md:w-auto mt-4 md:mt-0">
                <div className="text-right flex-1 md:flex-none">
                  <p className="text-base font-black">{note.subtasks?.length || 0}</p>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Sub-flows</p>
                </div>
                <div className="text-right flex-1 md:flex-none">
                  <p className="text-base font-black whitespace-nowrap">{note.timestamp}</p>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Last Modified</p>
                </div>
                <div className="w-12 h-12 rounded-2xl border border-border-app flex items-center justify-center group-hover:bg-accent-blue group-hover:border-transparent transition-all group-hover:rotate-12 group-hover:scale-110">
                  <Edit3 className="w-5 h-5 text-gray-400 group-hover:text-black" />
                </div>
              </div>
            </div>
          ))}
          {latestThinking.length === 0 && (
            <div className="py-20 text-center bg-card-app/30 border border-dashed border-border-app rounded-[2rem]">
              <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No notes available in categories</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
