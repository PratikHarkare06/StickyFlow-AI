import React from 'react';
import { 
  LayoutDashboard, 
  StickyNote, 
  CheckCircle2, 
  Archive, 
  Settings, 
  Grid,
  LogOut,
  X,
  Bell,
  Columns,
  BarChart3,
  CalendarDays,
  Trash2,
  User as UserIcon,
  Plus
} from 'lucide-react';
import { cn } from '../types';
import { View } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  noteCount: number;
  completedTodayCount: number;
  workspaces?: import('../types').Workspace[];
  currentWorkspaceId?: string;
  onWorkspaceChange?: (id: string) => void;
  onAddWorkspace?: (name: string, color: string) => void;
  onDeleteWorkspace?: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, onViewChange, isOpen, onClose, noteCount, completedTodayCount,
  workspaces = [], currentWorkspaceId, onWorkspaceChange, onAddWorkspace, onDeleteWorkspace
}) => {
  const { user, logout } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = React.useState(false);
  const [isAddingWorkspace, setIsAddingWorkspace] = React.useState(false);
  const [newWsName, setNewWsName] = React.useState('');

  // Streak tracking logic
  const [streak, setStreak] = React.useState<number>(() => {
    const saved = localStorage.getItem('streak_data');
    if (!saved) return 0;
    try {
      const { lastDate, count } = JSON.parse(saved);
      const last = new Date(lastDate);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);
      if (diffDays === 0) return count;
      if (diffDays === 1) return count; // Still alive, update later on activity
      return 0; // Streak broken
    } catch { return 0; }
  });

  React.useEffect(() => {
    if (completedTodayCount > 0) {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('streak_data');
      let newStreak = 1;
      if (saved) {
        try {
          const { lastDate, count } = JSON.parse(saved);
          const last = new Date(lastDate);
          const diffDays = Math.floor((new Date().getTime() - last.getTime()) / 86400000);
          if (diffDays === 0) newStreak = count;
          else if (diffDays === 1) newStreak = count + 1;
        } catch {}
      }
      localStorage.setItem('streak_data', JSON.stringify({ lastDate: today, count: newStreak }));
      setStreak(newStreak);
    }
  }, [completedTodayCount]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pinned', label: 'Pinned', icon: StickyNote },
    { id: 'kanban', label: 'Kanban Board', icon: Columns },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'trash', label: 'Trash', icon: Trash2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={cn(
      "w-60 h-screen bg-sidebar-app border-r border-border-app flex flex-col p-5 fixed left-0 top-0 z-50 transition-transform duration-500 shadow-2xl lg:shadow-none",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center shadow-2xl shadow-blue-400/20">
            <StickyNote className="text-black w-5 h-5 stroke-[2.5px]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-text-app">StickyFlow</h1>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-text-app hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {workspaces.length > 0 && onWorkspaceChange && (
        <div className="mb-6 relative">
          <button 
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full bg-card-app border border-border-app rounded-xl p-3 flex items-center justify-between hover:border-accent-blue/50 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <div className={cn("w-3 h-3 rounded-full", workspaces.find(w => w.id === currentWorkspaceId)?.color === 'blue' ? 'bg-blue-500' : 'bg-gray-400')} />
              <span className="font-bold text-sm truncate">
                {workspaces.find(w => w.id === currentWorkspaceId)?.name || 'Personal Board'}
              </span>
            </div>
            <Grid className="w-4 h-4 text-gray-500" />
          </button>

          <AnimatePresence>
            {showWorkspaceMenu && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 w-full bg-card-app border border-border-app rounded-xl shadow-xl z-20 overflow-hidden"
              >
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                  {workspaces.map(ws => (
                    <div key={ws.id} className="flex items-center justify-between group/ws rounded-lg hover:bg-text-app/5 pr-2">
                      <button 
                        onClick={() => { onWorkspaceChange(ws.id); setShowWorkspaceMenu(false); }}
                        className={cn(
                          "flex-1 flex items-center gap-2 p-2 rounded-lg text-sm text-left transition-colors cursor-pointer",
                          currentWorkspaceId === ws.id ? "text-accent-blue font-bold" : "text-gray-400 hover:text-text-app"
                        )}
                      >
                        <div className="w-2 h-2 rounded-full bg-current" />
                        <span className="truncate">{ws.name}</span>
                      </button>
                      {workspaces.length > 1 && onDeleteWorkspace && ws.id !== 'default' && (
                        <button onClick={() => onDeleteWorkspace(ws.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover/ws:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {onAddWorkspace && (
                  <div className="p-2 border-t border-border-app bg-text-app/5">
                    {isAddingWorkspace ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" autoFocus
                          value={newWsName} onChange={e => setNewWsName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newWsName.trim()) {
                              onAddWorkspace(newWsName.trim(), 'blue');
                              setNewWsName('');
                              setIsAddingWorkspace(false);
                            }
                            if (e.key === 'Escape') setIsAddingWorkspace(false);
                          }}
                          placeholder="Name..."
                          className="w-full bg-bg-app border border-border-app rounded-lg px-2 py-1 text-sm outline-none focus:border-accent-blue text-text-app"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsAddingWorkspace(true)}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-gray-400 hover:text-text-app hover:bg-text-app/5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Workspace</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1 py-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden shrink-0",
              currentView === item.id 
                ? "text-black font-bold" 
                : "text-gray-400 hover:text-text-app"
            )}
          >
            {currentView === item.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-accent-blue"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={cn(
              "w-4.5 h-4.5 relative z-10 transition-colors duration-300",
              currentView === item.id ? "text-black" : "text-gray-400 group-hover:text-text-app"
            )} />
            <span className="relative z-10 text-sm transition-colors duration-300">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-border-app/10 space-y-6">
        <div className="bg-text-app/5 border border-border-app rounded-3xl p-5 shadow-inner space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Storage</span>
            <span className="text-[10px] text-gray-500 font-bold">{Math.min(Math.round((noteCount / 100) * 100), 100)}%</span>
          </div>
          <div className="w-full bg-text-app/5 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-accent-blue h-full transition-all duration-1000" 
              style={{ width: `${Math.min((noteCount / 100) * 100, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-500 font-medium">{noteCount} of 100 notes used</p>
            {streak > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm">🔥</span>
                <span className="text-[10px] font-black text-orange-400">{streak}d streak</span>
              </div>
            )}
          </div>
        </div>

        <div 
          onClick={() => onViewChange('settings')}
          className="bg-card-app border border-border-app rounded-[2rem] p-3 flex items-center gap-3 group hover:border-accent-blue/50 transition-all cursor-pointer shadow-sm"
        >
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'U')}&background=3B82F6&color=fff&rounded=true`;
              }}
              className="w-10 h-10 rounded-2xl object-cover border-2 border-transparent group-hover:border-accent-blue/30 transition-colors shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/20 flex items-center justify-center border-2 border-transparent group-hover:border-accent-blue/30 transition-colors">
              <UserIcon className="w-5 h-5 text-accent-blue" />
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="text-xs font-black text-text-app truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'Guest Worker'}
            </span>
            <span className="text-[10px] text-accent-blue font-bold uppercase tracking-widest">{user ? 'Cloud Sync' : 'Offline'}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); if(user) logout(); else window.dispatchEvent(new CustomEvent('skip-auth', { detail: false })); }}
            className="ml-auto group/logout p-1.5 hover:bg-red-500/10 rounded-xl"
            title={user ? "Sign Out" : "Sign In"}
          >
            <LogOut className={`w-4 h-4 transition-colors ${user ? 'text-gray-500 group-hover/logout:text-red-400' : 'text-accent-blue'}`} />
          </button>
        </div>
      </div>
    </aside>
  );
};
