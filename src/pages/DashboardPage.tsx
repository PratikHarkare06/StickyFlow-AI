import React from 'react';
import { Search, Plus, Palette, Clock } from 'lucide-react';
import { StickyNoteCard } from '../components/StickyNoteCard';
import { FilterPanel, NoteFilters, DEFAULT_FILTERS } from '../components/FilterPanel';
import { Note, STICKY_COLORS, cn } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';

interface DashboardPageProps {
  notes: Note[];
  onAddNote: (content: string, category: string, color: string, reminderDate?: string) => void;
  onDeleteNote: (id: string) => void;
  onPinNote: (id: string) => void;
  onToggleComplete: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewChange: (view: any) => void;
  onNoteClick: (id: string) => void;
  onReorderNotes?: (oldIndex: number, newIndex: number) => void;
  onOpenQuickNote?: () => void;
  onContextMenu?: (note: Note, e: React.MouseEvent) => void;
  noteFilters?: NoteFilters;
  onFiltersChange?: (f: NoteFilters) => void;
  onFiltersClear?: () => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

const CATEGORIES = [
  { name: 'Work', color: 'yellow', hex: '#FACC15' },
  { name: 'Personal', color: 'pink', hex: '#EC4899' },
  { name: 'Ideas', color: 'blue', hex: '#3B82F6' },
  { name: 'Urgent', color: 'cyan', hex: '#06B6D4' },
];


export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  notes, 
  onAddNote, 
  onDeleteNote, 
  onPinNote, 
  onToggleComplete,
  searchQuery,
  onSearchChange,
  onViewChange,
  onNoteClick,
  onReorderNotes,
  onOpenQuickNote,
  onContextMenu,
  noteFilters = DEFAULT_FILTERS,
  onFiltersChange,
  onFiltersClear,
  selectedIds = [],
  onToggleSelect,
}) => {
  const [content, setContent] = React.useState('');
  const [selectedCat, setSelectedCat] = React.useState('Work');
  const [reminderDate, setReminderDate] = React.useState<string | undefined>(undefined);
  const [showReminder, setShowReminder] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, isPinnedSection: boolean) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderNotes) {
      const activeId = active.id.toString();
      const overId = over.id.toString();
      const oldIndex = notes.findIndex(n => n.id === activeId);
      const newIndex = notes.findIndex(n => n.id === overId);
      onReorderNotes(oldIndex, newIndex);
    }
  };

  const handleAddNote = () => {
    if (!content.trim()) return;
    const catObj = CATEGORIES.find(c => c.name === selectedCat);
    onAddNote(content, selectedCat, catObj?.color || 'yellow', reminderDate);
    setContent('');
    setReminderDate(undefined);
    setShowReminder(false);
  };

  const pinnedNotes = [...notes].filter(n => n.isPinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const otherNotes = [...notes].filter(n => !n.isPinned).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const dynamicDistributionData = CATEGORIES.map(cat => ({
    name: cat.name,
    value: notes.filter(n => n.category === cat.name).length,
    color: cat.hex
  })).filter(d => d.value > 0);

  const totalNotes = notes.length;
  const completedCount = notes.filter(n => n.isCompleted).length;
  const completionPercentage = totalNotes > 0 ? Math.round((completedCount / totalNotes) * 100) : 0;
  const pinnedCount = pinnedNotes.length;

  // Build real bar chart: notes created per weekday (last 7 days)
  const realBarData = React.useMemo(() => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    notes.forEach(note => {
      const ts = new Date(note.timestamp);
      const diffDays = Math.floor((now.getTime() - ts.getTime()) / 86400000);
      if (diffDays < 7) {
        const dayIndex = ts.getDay();
        counts[dayIndex]++;
      }
    });
    return days.map((name, i) => ({ name, value: counts[i] }));
  }, [notes]);

  // Top category by note count
  const topCategory = dynamicDistributionData.length > 0
    ? dynamicDistributionData.reduce((a, b) => a.value > b.value ? a : b)
    : null;

  return (
    <div className="space-y-6 lg:space-y-10 pb-32 pt-16 lg:pt-20 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mt-14 lg:mt-0 lg:pr-[360px]">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-1">My Workspace</h2>
          <p className="text-gray-500 font-bold text-xs lg:text-sm">Capture your thoughts in vibrant flow</p>
        </div>
        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-500 group-focus-within:text-text-app transition-colors" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-card-app border border-border-app rounded-2xl py-2.5 lg:py-3 pl-11 lg:pl-12 pr-6 w-full lg:w-48 xl:w-64 focus:outline-none focus:border-accent-blue/50 transition-all font-bold text-sm text-text-app"
            />
          </div>
          {/* Filter panel */}
          {onFiltersChange && onFiltersClear && (
            <FilterPanel
              filters={noteFilters}
              onChange={onFiltersChange}
              onClear={onFiltersClear}
              resultCount={notes.filter(n => !n.isCompleted && !n.isArchived).length}
            />
          )}
        </div>
      </header>

      {/* Quick Input */}
      <div className="bg-card-app border border-border-app rounded-[1.5rem] lg:rounded-[2rem] p-6 lg:p-8 space-y-4 lg:space-y-6 shadow-2xl">
        <textarea 
          placeholder="Write a quick todo or thought..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleAddNote();
            }
          }}
          className="w-full bg-transparent text-lg lg:text-xl font-black resize-none focus:outline-none placeholder:text-gray-400 h-20 text-text-app"
        />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-4 border-t border-border-app/10 gap-6 lg:gap-0">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.name}
                onClick={() => setSelectedCat(cat.name)}
                className={cn(
                  "px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedCat === cat.name 
                    ? `${STICKY_COLORS[cat.color as keyof typeof STICKY_COLORS]} shadow-lg scale-105 shadow-black/10` 
                    : "bg-text-app/5 text-gray-400 hover:bg-text-app/10"
                )}
              >
                {selectedCat === cat.name && "✓ "}
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-3">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  const currentIndex = CATEGORIES.findIndex(c => c.name === selectedCat);
                  const nextIndex = (currentIndex + 1) % CATEGORIES.length;
                  setSelectedCat(CATEGORIES[nextIndex].name);
                }}
                className="p-2.5 lg:p-3 text-gray-500 hover:text-text-app transition-colors hover:bg-text-app/5 rounded-xl group"
                title="Change sticky color"
              >
                <Palette className="w-5 h-5 group-active:scale-90 transition-transform" />
              </button>
              <div className="relative group">
                <button 
                  onClick={() => setShowReminder(!showReminder)}
                  className={cn(
                    "p-2.5 lg:p-3 transition-colors rounded-xl flex items-center gap-2",
                    showReminder ? "bg-sticky-pink/10 text-sticky-pink" : "text-gray-500 hover:text-text-app hover:bg-text-app/5"
                  )}
                  title="Set reminder"
                >
                  <Clock className="w-5 h-5 group-active:scale-90 transition-transform" />
                  {reminderDate && <span className="text-[8px] font-black uppercase">Active</span>}
                </button>
                {showReminder && (
                  <div className="absolute bottom-full left-0 mb-4 bg-card-app border border-border-app p-4 rounded-2xl shadow-2xl z-50 min-w-[200px]">
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Flow Reminder</p>
                    <input 
                      type="date" 
                      value={reminderDate || ''}
                      onChange={(e) => setReminderDate(e.target.value || undefined)}
                      className="w-full bg-black/10 border border-border-app rounded-lg px-3 py-2 text-xs font-bold text-text-app focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={handleAddNote}
              className="bg-accent-blue text-black px-6 lg:px-8 py-3 lg:py-3.5 rounded-[1rem] lg:rounded-[1.25rem] font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-400/10 hover:scale-105 active:scale-95 transition-all text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.5px]" />
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-5">
            <h3 className="text-xl font-black tracking-tight">Pinned Flow</h3>
          </div>
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => handleDragEnd(e, true)}
          >
            <SortableContext 
              items={pinnedNotes.map(n => n.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
                {pinnedNotes.map(note => (
                  <StickyNoteCard 
                    key={note.id} 
                    note={note} 
                    onDelete={onDeleteNote}
                    onPin={onPinNote}
                    onToggleComplete={onToggleComplete}
                    onClick={onToggleSelect ? undefined : () => onNoteClick(note.id)}
                    onContextMenu={onContextMenu}
                    onToggleSelect={onToggleSelect}
                    isSelected={selectedIds.includes(note.id)}
                    isSortable={!onToggleSelect}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

      <section>
        <div className="flex justify-between items-end mb-5">
          <h3 className="text-xl font-black tracking-tight">Recent Notes</h3>
          <button 
            onClick={() => onViewChange('categories')}
            className="text-[10px] lg:text-xs font-black text-gray-500 hover:text-text-app transition-colors uppercase tracking-widest"
          >
            View All
          </button>
        </div>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => handleDragEnd(e, false)}
        >
          <SortableContext 
            items={otherNotes.map(n => n.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
              {otherNotes.map(note => (
                <StickyNoteCard 
                  key={note.id} 
                  note={note} 
                  onDelete={onDeleteNote}
                  onPin={onPinNote}
                  onToggleComplete={onToggleComplete}
                  onClick={onToggleSelect ? undefined : () => onNoteClick(note.id)}
                  onContextMenu={onContextMenu}
                  onToggleSelect={onToggleSelect}
                  isSelected={selectedIds.includes(note.id)}
                  isSortable={!onToggleSelect}
                />
              ))}
              {notes.length === 0 && (
                <div className="col-span-full py-16 text-center bg-text-app/5 border border-dashed border-border-app rounded-[1.5rem] lg:rounded-[2rem]">
                  <p className="text-gray-500 font-black uppercase tracking-widest">No notes found matching your flow</p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <div className="relative">
        {/* Productivity Flow */}
        <section className="bg-card-app border border-border-app rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl lg:text-2xl font-black mb-3">Productivity Flow</h3>
                <p className="text-gray-500 font-bold text-sm lg:text-base max-w-xs">You've completed {completedCount} tasks. Keep the momentum going!</p>
              </div>
              <div className="flex gap-8 lg:gap-12 pt-4 flex-wrap">
                <div>
                  <p className="text-5xl lg:text-6xl font-black mb-1">{completionPercentage}%</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Completion</p>
                </div>
                <div>
                  <p className="text-5xl lg:text-6xl font-black mb-1 text-accent-blue">{totalNotes}</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Flows</p>
                </div>
                {pinnedCount > 0 && (
                  <div>
                    <p className="text-5xl lg:text-6xl font-black mb-1 text-sticky-pink">{pinnedCount}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pinned</p>
                  </div>
                )}
                {topCategory && (
                  <div>
                    <p className="text-2xl lg:text-3xl font-black mb-1" style={{ color: topCategory.color }}>{topCategory.name}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Top Category</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-48 lg:h-64 flex flex-col justify-end">
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={realBarData}>
                  <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {realBarData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={_entry.value > 0 ? '#A5C9FF' : '#E2E8F0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between px-4 mt-6">
                {realBarData.map((d, i) => (
                  <span key={i} className="text-[10px] font-black text-gray-600 uppercase">{d.name}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Floating Quick Note Button */}
        <button 
          onClick={() => onOpenQuickNote?.()}
          className="fixed bottom-10 right-10 bg-accent-blue text-black px-6 py-4 rounded-full font-bold flex items-center gap-2.5 shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-110 active:scale-95 transition-all z-50 text-sm"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          Quick Note
        </button>
      </div>
    </div>
  );
};
