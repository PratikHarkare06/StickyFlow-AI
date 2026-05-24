import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CompletedPage } from './pages/CompletedPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ArchivePage } from './pages/ArchivePage';
import { RemindersPage } from './pages/RemindersPage';
import { TaskDetailsPage } from './pages/TaskDetailsPage';
import { KanbanPage } from './pages/KanbanPage';
import { AnalyticsDashboard } from './pages/AnalyticsPage';
import { CalendarView } from './pages/CalendarPage';
import { TrashPage } from './pages/TrashPage';
import { QuickNoteModal } from './components/QuickNoteModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ContextMenu } from './components/ContextMenu';
import { useToast } from './components/ToastProvider';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { DashboardSkeleton } from './components/Skeletons';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { FilterPanel, NoteFilters, DEFAULT_FILTERS } from './components/FilterPanel';
import { BulkActionBar } from './components/BulkActionBar';
import { PomodoroTimer } from './components/PomodoroTimer';
import { SharedNoteView } from './components/SharedNoteView';
import { NoteSearchOverlay } from './components/NoteSearchOverlay';
import { NotificationCenter } from './components/NotificationCenter';
import { TagFilterBar } from './components/TagManager';
import { ImportNotesModal } from './components/ImportNotesModal';
import { processRecurringReminder } from './components/RecurrencePicker';
import { AIChatbot } from './components/AIChatbot';
import { View, cn, Note } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, MoreVertical, Bell, LayoutDashboard, Tag, Settings, Sun, Moon, Cloud, CloudOff, LogOut, User as UserIcon, Wifi, WifiOff, Keyboard, Timer, Layers, Upload } from 'lucide-react';
import { useNotes } from './hooks/useNotes';
import { Command } from 'cmdk';
import { isSameDay, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';
import LoginPage from './pages/LoginPage';
import { useAuth } from './contexts/AuthContext';


function MainApp({ user, logout, isOnline, setSkipAuth }: any) {
  // ── Sync view with browser history so Back button works ──────────────────────
  const getInitialView = (): View => {
    // Read view from URL hash e.g. #dashboard, #kanban
    const hash = window.location.hash.replace('#', '') as View;
    const validViews: View[] = ['dashboard','pinned','kanban','categories','completed','archive','reminders','settings','details','analytics','calendar','trash'];
    return validViews.includes(hash) ? hash : 'dashboard';
  };

  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth > 1024 : false;
  });
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('fontFamily') || 'Urbanist');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'Normal');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#A5C9FF');
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : { desktop: true, email: false, smart: false };
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [noteFilters, setNoteFilters] = useState<NoteFilters>(DEFAULT_FILTERS);
  
  const [workspaces, setWorkspaces] = useState<import('./types').Workspace[]>(() => {
    const saved = localStorage.getItem('workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Personal Board', color: 'blue' }];
  });
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    return localStorage.getItem('currentWorkspaceId') || 'default';
  });

  React.useEffect(() => {
    localStorage.setItem('workspaces', JSON.stringify(workspaces));
  }, [workspaces]);
  
  React.useEffect(() => {
    localStorage.setItem('currentWorkspaceId', currentWorkspaceId);
  }, [currentWorkspaceId]);

  const { 
    notes, 
    loading: notesLoading,
    syncing,
    addNote, 
    updateNote,
    deleteNote, 
    togglePin, 
    toggleComplete, 
    toggleArchive, 
    archiveAllCompleted, 
    setReminder, 
    clearCompleted,
    updateStatus,
    undoLast,
    duplicateNote,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderNotes,
    addAttachment,
    logActivity,
    restoreNote, permanentDelete, emptyTrash,
    addTag, removeTag, allTags,
    setRecurrence, bulkImport
  } = useNotes(user?.uid ?? null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const toast = useToast();

  // ── Context menu state ───────────────────────────────────────────────────
  const [ctxMenu, setCtxMenu] = useState<{ note: Note; x: number; y: number } | null>(null);

  const handleContextMenu = React.useCallback((note: Note, e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ note, x: e.clientX, y: e.clientY });
  }, []);

  // ── Toast-wrapped action handlers ───────────────────────────────────────
  const handleDeleteNote = React.useCallback((id: string) => {
    deleteNote(id);
    toast.success('Note deleted — press ⌫ Z to undo');
  }, [deleteNote, toast]);

  const handleTogglePin = React.useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    togglePin(id);
    toast.info(note?.isPinned ? 'Note unpinned' : '📌 Note pinned to top');
  }, [togglePin, notes, toast]);

  const handleToggleComplete = React.useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note && !note.isCompleted) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [accentColor, '#FACC15', '#EC4899', '#10B981'] });
      toast.success('✅ Task completed!');
    } else {
      toast.info('Marked incomplete');
    }
    toggleComplete(id);
  }, [notes, toggleComplete, toast, accentColor]);

  const handleToggleArchive = React.useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    toggleArchive(id);
    toast.info(note?.isArchived ? 'Note unarchived' : '🗄️ Note archived');
  }, [toggleArchive, notes, toast]);

  const handleDuplicate = React.useCallback((id: string) => {
    duplicateNote(id);
    toast.success('📋 Note duplicated!');
  }, [duplicateNote, toast]);

  const handleUndo = React.useCallback(() => {
    undoLast();
    toast.info('↩ Action undone');
  }, [undoLast, toast]);

  const handleAddNote = React.useCallback(async (content: string, category: string, color: string, reminderDate?: string) => {
    try {
      await addNote(content, category, color, reminderDate, currentWorkspaceId);
      toast.success('✨ Note added!');
    } catch (e: any) {
      console.error('Failed to save note:', e);
      toast.error('❌ Failed to save note to Cloud. Check Firestore console/rules!');
    }
  }, [addNote, toast, currentWorkspaceId]);

  // ── Bulk Selection ───────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleToggleSelect = React.useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleBulkDelete = React.useCallback((ids: string[]) => {
    ids.forEach(id => deleteNote(id));
    setSelectedIds([]);
    toast.success(`🗑️ ${ids.length} note${ids.length !== 1 ? 's' : ''} deleted`);
  }, [deleteNote, toast]);

  const handleBulkArchive = React.useCallback((ids: string[]) => {
    ids.forEach(id => toggleArchive(id));
    setSelectedIds([]);
    toast.info(`🗄️ ${ids.length} note${ids.length !== 1 ? 's' : ''} archived`);
  }, [toggleArchive, toast]);

  const handleBulkComplete = React.useCallback((ids: string[]) => {
    ids.forEach(id => toggleComplete(id));
    setSelectedIds([]);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
    toast.success(`✅ ${ids.length} note${ids.length !== 1 ? 's' : ''} completed!`);
  }, [toggleComplete, toast]);

  // ── Pomodoro timer ────────────────────────────────────────────────────────
  const [showPomodoro, setShowPomodoro] = useState(false);

  // ── Onboarding: show once on first visit ──────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('stickyflow_onboarded')
  );

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ── Push view changes to URL hash ─────────────────────────────────────────────
  const navigateTo = React.useCallback((view: View) => {
    const newHash = `#${view}`;
    if (window.location.hash !== newHash) {
      window.history.pushState({ view }, '', newHash);
    }
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // ── Listen to popstate (back/forward buttons) ─────────────────────────────────
  React.useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash.startsWith('share/')) {
        setActiveShareId(hash.split('/')[1]);
        return;
      } else {
        setActiveShareId(null);
      }

      const validViews: View[] = ['dashboard','pinned','kanban','categories','completed','archive','reminders','settings','details'];
      if (validViews.includes(hash as View)) {
        setCurrentView(hash as View);
      } else {
        // If hash is empty/unknown, go to dashboard without adding to history
        setCurrentView('dashboard');
        window.history.replaceState({ view: 'dashboard' }, '', '#dashboard');
      }
    };

    // Initial check
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash.startsWith('share/')) {
      setActiveShareId(initialHash.split('/')[1]);
    } else if (!window.location.hash) {
      window.history.replaceState({ view: 'dashboard' }, '', '#dashboard');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── Global Cmd/Ctrl+Z undo shortcut ───────────────────────────────────────────
  React.useEffect(() => {
    const onUndoKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !(document.activeElement as HTMLElement)?.isContentEditable) {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', onUndoKeyDown);
    return () => window.removeEventListener('keydown', onUndoKeyDown);
  }, [handleUndo]);

  // ── ? shortcut → Keyboard shortcuts modal ─────────────────────────────────
  React.useEffect(() => {
    const onQuestionMark = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !(document.activeElement as HTMLElement)?.isContentEditable) {
          setShowShortcuts(s => !s);
        }
      }
    };
    window.addEventListener('keydown', onQuestionMark);
    return () => window.removeEventListener('keydown', onQuestionMark);
  }, []);

  // ── Cmd+K shortcut → Global search overlay ──────────────────────────────
  React.useEffect(() => {
    const onCmdK = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(s => !s);
      }
    };
    window.addEventListener('keydown', onCmdK);
    return () => window.removeEventListener('keydown', onCmdK);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('fontFamily', fontFamily);
  }, [fontFamily]);

  React.useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const [openCommand, setOpenCommand] = useState(false);

  // Initialize Notification Permissions
  React.useEffect(() => {
    if (notifications.desktop && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [notifications.desktop]);

  // Background Daemon: Checks for reminders every 10 seconds
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (notifications.desktop || notifications.browser) {
      interval = setInterval(() => {
        const today = new Date();
        notes.forEach(note => {
          if (!note.isCompleted && !note.isArchived && !note.isTrashed && note.reminderDate) {
            const reminderDate = parseISO(note.reminderDate);
            // Check if reminder is today and we haven't notified yet
            if (isSameDay(reminderDate, today)) {
              const notificationKey = `notified_${note.id}_${today.toDateString()}`;
              if (!localStorage.getItem(notificationKey)) {
                const plainText = note.content.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...';
                const recurrenceLabel = note.recurrence?.type && note.recurrence.type !== 'none' 
                  ? ` 🔄 Repeats ${note.recurrence.type}` : '';
                
                // 1. System Notification
                if (notifications.desktop && Notification.permission === 'granted') {
                  new Notification('StickyFlow Reminder 🔔', { body: plainText + recurrenceLabel });
                }

                // 2. In-App Toast
                if (notifications.browser) {
                  toast.info(
                    <div className="flex flex-col gap-1">
                      <p className="font-black text-xs uppercase tracking-widest">🔔 Reminder Due</p>
                      <p className="text-[11px] opacity-70 line-clamp-1">{plainText}</p>
                      {recurrenceLabel && (
                        <p className="text-[9px] font-bold text-violet-400">🔄 Recurring · {note.recurrence?.type}</p>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedNoteId(note.id);
                          navigateTo('details');
                        }}
                        className="text-[10px] font-black underline text-accent-blue uppercase mt-1 text-left"
                      >
                        Open Note
                      </button>
                    </div>,
                    { icon: null, duration: 10000 }
                  );
                }

                localStorage.setItem(notificationKey, 'true');

                // 3. Auto-advance recurring reminders
                if (note.recurrence && note.recurrence.type !== 'none') {
                  const nextDate = processRecurringReminder(note.reminderDate, note.recurrence as any);
                  if (nextDate) {
                    setReminder(note.id, nextDate);
                  }
                }
              }
            }
          }
        });
      }, 10000); 
    }
    return () => clearInterval(interval);
  }, [notes, notifications, toast, navigateTo]);

  // Toggle the menu when ⌘K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  React.useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // ── Apply search + advanced filters ─────────────────────────────────────────
  const filteredNotes = React.useMemo(() => {
    return notes.filter(note => {
      // Workspace filter
      const wId = note.workspaceId || 'default';
      if (wId !== currentWorkspaceId) return false;

      // Search query
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        note.content.toLowerCase().includes(q) ||
        note.category.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      // Category filter
      if (noteFilters.categories.length > 0 && !noteFilters.categories.includes(note.category)) return false;

      // Color filter
      if (noteFilters.colors.length > 0 && !noteFilters.colors.includes(note.color)) return false;

      // Pinned filter
      if (noteFilters.hasPinned !== null && note.isPinned !== noteFilters.hasPinned) return false;

      // Reminder filter
      if (noteFilters.hasReminder !== null) {
        const hasR = !!note.reminderDate;
        if (hasR !== noteFilters.hasReminder) return false;
      }

      // Subtasks filter
      if (noteFilters.hasSubtasks !== null) {
        const hasSub = (note.subtasks?.length ?? 0) > 0;
        if (hasSub !== noteFilters.hasSubtasks) return false;
      }

      return true;
    });
  }, [notes, searchQuery, noteFilters]);

  // Active notes = not trashed, optionally filtered by tags
  const activeNotes = React.useMemo(() => {
    let result = filteredNotes.filter(n => !n.isTrashed);
    if (selectedTags.length > 0) {
      result = result.filter(n => selectedTags.every(t => n.tags?.includes(t)));
    }
    return result;
  }, [filteredNotes, selectedTags]);

  const renderView = () => {
    if (notesLoading) return <DashboardSkeleton />;
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            <DashboardPage 
              notes={filteredNotes.filter(n => !n.isCompleted && !n.isArchived)} 
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onPinNote={handleTogglePin}
              onToggleComplete={handleToggleComplete}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onViewChange={navigateTo}
              onReorderNotes={reorderNotes}
              onContextMenu={handleContextMenu}
              noteFilters={noteFilters}
              onFiltersChange={setNoteFilters}
              onFiltersClear={() => setNoteFilters(DEFAULT_FILTERS)}
              selectedIds={selectedIds}
              onToggleSelect={selectedIds.length > 0 ? handleToggleSelect : undefined}
              onNoteClick={(id) => {
                setSelectedNoteId(id);
                navigateTo('details');
              }}
              onOpenQuickNote={() => setIsQuickNoteOpen(true)}
            />
            {/* Activity Heatmap at bottom of dashboard */}
            <div className="mt-8">
              <ActivityHeatmap notes={notes.filter(n => !n.isArchived)} />
            </div>
          </>
        );
      case 'pinned':
        return (
          <DashboardPage 
            notes={filteredNotes.filter(n => n.isPinned && !n.isArchived)} 
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onPinNote={handleTogglePin}
            onToggleComplete={handleToggleComplete}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewChange={navigateTo}
            onReorderNotes={reorderNotes}
            onContextMenu={handleContextMenu}
            selectedIds={selectedIds}
            onToggleSelect={selectedIds.length > 0 ? handleToggleSelect : undefined}
            onNoteClick={(id) => {
              setSelectedNoteId(id);
              navigateTo('details');
            }}
            onOpenQuickNote={() => setIsQuickNoteOpen(true)}
          />
        );
      case 'kanban':
        return (
          <KanbanPage 
            notes={filteredNotes.filter(n => !n.isArchived)} 
            onAddNote={handleAddNote}
            onUpdateStatus={updateStatus}
            onDeleteNote={deleteNote}
            onPinNote={togglePin}
            onToggleComplete={toggleComplete}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewChange={navigateTo}
            onNoteClick={(id) => {
              setSelectedNoteId(id);
              navigateTo('details');
            }}
            onOpenQuickNote={() => setIsQuickNoteOpen(true)}
          />
        );
      case 'completed':
        return (
          <CompletedPage 
            notes={filteredNotes.filter(n => n.isCompleted && !n.isArchived)} 
            onDeleteNote={deleteNote}
            onRestoreNote={handleToggleComplete}
            onClearHistory={clearCompleted}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewChange={navigateTo}
          />
        );
      case 'archive':
        return (
          <ArchivePage 
            notes={filteredNotes.filter(n => n.isArchived)} 
            onDeleteNote={deleteNote}
            onToggleArchive={toggleArchive}
            onArchiveAll={archiveAllCompleted}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewChange={navigateTo}
          />
        );
      case 'reminders':
        return (
          <RemindersPage 
            notes={filteredNotes.filter(n => !n.isArchived)} 
            onToggleComplete={handleToggleComplete}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onViewChange={navigateTo}
            onNoteClick={(id) => {
              setSelectedNoteId(id);
              navigateTo('details');
            }}
            onAddClick={() => setIsQuickNoteOpen(true)}
          />
        );
      case 'details':
        return (
          <TaskDetailsPage 
            note={notes.find(n => n.id === selectedNoteId)}
            onUpdateNote={async (id, content, cat, col) => {
              await updateNote(id, content, cat, col);
              logActivity(id, 'edited', 'Note content updated');
            }}
            onDeleteNote={(id) => { deleteNote(id); navigateTo('dashboard'); }}
            onPinNote={togglePin}
            onToggleComplete={async (id) => {
              await toggleComplete(id);
              const n = notes.find(x => x.id === id);
              logActivity(id, 'status_change', n?.isCompleted ? 'Marked as TODO' : 'Marked as Completed');
            }}
            onToggleArchive={toggleArchive}
            onSetReminder={setReminder}
            onAddSubtask={addSubtask}
            onToggleSubtask={toggleSubtask}
            onDeleteSubtask={deleteSubtask}
            onBack={() => navigateTo('dashboard')}
            onAddAttachment={addAttachment}
            onLogActivity={logActivity}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            allTags={allTags}
            onSetRecurrence={setRecurrence}
            allNotes={activeNotes}
            onNoteNavigate={(id) => { setSelectedNoteId(id); navigateTo('details'); }}
          />
        );
      case 'categories':
        return (
          <CategoriesPage 
            notes={notes} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={() => setIsQuickNoteOpen(true)}
            onViewChange={navigateTo}
            onNoteClick={(id) => {
              setSelectedNoteId(id);
              navigateTo('details');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            theme={theme} 
            setTheme={setTheme} 
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard notes={activeNotes} />;
      case 'calendar':
        return (
          <CalendarView
            notes={activeNotes}
            onNoteClick={(id) => { setSelectedNoteId(id); navigateTo('details'); }}
            onAddClick={() => setIsQuickNoteOpen(true)}
          />
        );
      case 'trash':
        return (
          <TrashPage
            trashedNotes={notes.filter(n => n.isTrashed && (n.workspaceId || 'default') === currentWorkspaceId)}
            onRestore={restoreNote}
            onPermanentDelete={permanentDelete}
            onEmptyTrash={emptyTrash}
          />
        );
      default:
        return (
          <DashboardPage 
            notes={activeNotes} 
            onAddNote={handleAddNote} 
            onDeleteNote={deleteNote} 
            onPinNote={togglePin} 
            onToggleComplete={handleToggleComplete}
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            onReorderNotes={reorderNotes}
            onViewChange={navigateTo}
            onNoteClick={(id) => {
              setSelectedNoteId(id);
              navigateTo('details');
            }}
          />
        );
    }
  };

  const getFontSizeScale = () => {
    switch (fontSize) {
      case 'Small': return '0.9';
      case 'Large': return '1.1';
      case 'Extra Large': return '1.2';
      default: return '1';
    }
  };

  return (
    <div 
      className="min-h-screen bg-bg-app flex selection:bg-accent-blue selection:text-black overflow-x-hidden transition-colors duration-500"
      style={{ 
        fontFamily: `${fontFamily}, font-sans`,
        fontSize: `calc(1rem * ${getFontSizeScale()})`
      }}
    >
      <Sidebar 
        currentView={currentView} 
        onViewChange={navigateTo} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        noteCount={notes.length}
        completedTodayCount={notes.filter(n => {
          if (!n.isCompleted) return false;
          const ts = new Date(n.timestamp);
          const today = new Date();
          return ts.getFullYear() === today.getFullYear() &&
                 ts.getMonth() === today.getMonth() &&
                 ts.getDate() === today.getDate();
        }).length}
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
        onWorkspaceChange={setCurrentWorkspaceId}
        onAddWorkspace={(name, color) => {
          const newWs = { id: Date.now().toString(), name, color };
          setWorkspaces(prev => [...prev, newWs]);
          setCurrentWorkspaceId(newWs.id);
        }}
        onDeleteWorkspace={(id) => {
          if (workspaces.length <= 1) return;
          setWorkspaces(prev => prev.filter(w => w.id !== id));
          if (currentWorkspaceId === id) {
            setCurrentWorkspaceId(workspaces.find(w => w.id !== id)?.id || 'default');
          }
        }}
      />
      
      {/* Onboarding — show only on first visit */}
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Right-click context menu */}
      {ctxMenu && (
        <ContextMenu
          note={ctxMenu.note}
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          onPin={handleTogglePin}
          onDelete={handleDeleteNote}
          onDuplicate={handleDuplicate}
          onToggleArchive={handleToggleArchive}
          onToggleComplete={handleToggleComplete}
          onEdit={(id) => { setSelectedNoteId(id); navigateTo('details'); }}
        />
      )}

      {/* Keyboard Shortcuts Modal — press ? */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Global Search Overlay — Cmd+K */}
      <NoteSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        notes={activeNotes}
        onNoteClick={(id) => {
          setSelectedNoteId(id);
          navigateTo('details');
        }}
      />
      
      {/* Mobile & Desktop Menu Toggle Button */}
      {!isSidebarOpen && (
        <div className="fixed top-6 left-6 z-40">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-card-app border border-border-app rounded-2xl text-text-app shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <div className="w-6 h-0.5 bg-current mb-1.5 rounded-full" />
            <div className="w-4 h-0.5 bg-current mb-1.5 rounded-full" />
            <div className="w-6 h-0.5 bg-current rounded-full" />
          </button>
        </div>
      )}

      {/* Top-right status bar (auth + sync + online indicator + timer) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Pomodoro timer toggle */}
        <button
          onClick={() => setShowPomodoro(p => !p)}
          title="Focus Timer"
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all border',
            showPomodoro
              ? 'bg-accent-blue text-black border-accent-blue shadow-lg shadow-accent-blue/20'
              : 'bg-text-app/5 border-border-app text-gray-500 hover:border-accent-blue/40 hover:text-text-app'
          )}
        >
          <Timer className="w-3.5 h-3.5" />
          {showPomodoro ? 'Timer On' : 'Focus'}
        </button>

        {/* Notification Center */}
        <NotificationCenter
          notes={activeNotes}
          onNoteClick={(id) => { setSelectedNoteId(id); navigateTo('details'); }}
          onDismissReminder={(id) => setReminder(id, undefined)}
        />

        {/* Online/Offline badge */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black"
            >
              <WifiOff className="w-3 h-3" /> Offline
            </motion.div>
          )}
        </AnimatePresence>
        {/* Sync indicator */}
        {syncing && user && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-black">
            <Cloud className="w-3 h-3 animate-pulse" /> Syncing...
          </div>
        )}

      </div>

      {/* Pomodoro Timer Widget */}
      <AnimatePresence>
        {showPomodoro && <PomodoroTimer onClose={() => setShowPomodoro(false)} />}
      </AnimatePresence>

      {/* Shared Note Viewer */}
      <AnimatePresence>
        {activeShareId && (
          <SharedNoteView 
            shareId={activeShareId} 
            onClose={() => {
              setActiveShareId(null);
              navigateTo('dashboard');
              window.history.replaceState({ view: 'dashboard' }, '', '#dashboard');
            }} 
          />
        )}
      </AnimatePresence>

      {/* Bulk Action Bar — floats above bottom nav when notes selected */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onDeleteAll={handleBulkDelete}
        onArchiveAll={handleBulkArchive}
        onCompleteAll={handleBulkComplete}
      />

      <main className={cn(
        "flex-1 p-5 lg:p-10 overflow-y-auto custom-scrollbar h-screen bg-bg-app transition-all duration-500",
        isSidebarOpen ? "lg:ml-60" : "ml-0 pl-20 lg:pl-28"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Offline banner */}
            {!isOnline && (
              <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <WifiOff className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">You're offline — changes are saved locally and will sync when you reconnect.</span>
              </div>
            )}
            {/* Tag filter bar */}
            {allTags.length > 0 && currentView !== 'details' && currentView !== 'settings' && currentView !== 'trash' && (
              <div className="mb-6">
                <TagFilterBar
                  allTags={allTags}
                  selectedTags={selectedTags}
                  onToggle={(tag) => setSelectedTags(prev => 
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  )}
                  onClear={() => setSelectedTags([])}
                />
              </div>
            )}
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <QuickNoteModal 
        isOpen={isQuickNoteOpen} 
        onClose={() => setIsQuickNoteOpen(false)} 
        onAdd={handleAddNote} 
      />

      <ImportNotesModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={async (importedNotes) => {
          await bulkImport(importedNotes);
          toast.success(`${importedNotes.length} note${importedNotes.length !== 1 ? 's' : ''} imported!`);
        }}
      />

      <AnimatePresence>
        {openCommand && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pt-[10vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenCommand(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <Command 
              className="relative w-full max-w-lg bg-card-app border border-border-app rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              label="Global Command Menu"
            >
              <div className="flex items-center border-b border-border-app px-4 py-3 gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <Command.Input 
                  autoFocus
                  placeholder="What do you want to do? (Cmd/Ctrl + K)" 
                  className="w-full bg-transparent text-text-app placeholder:text-gray-500 focus:outline-none text-base"
                />
                <button 
                  onClick={() => setOpenCommand(false)}
                  className="text-[10px] font-black uppercase tracking-widest bg-border-app/50 px-2 py-1 rounded"
                >
                  ESC
                </button>
              </div>

              <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                <Command.Empty className="py-6 text-center text-sm font-bold text-gray-500">
                  No commands found.
                </Command.Empty>

                <Command.Group heading="Flow Management" className="text-xs font-black uppercase tracking-widest text-gray-500 p-2 pb-1">
                  <Command.Item 
                    onSelect={() => { setIsQuickNoteOpen(true); setOpenCommand(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-text-app/10 aria-selected:text-text-app text-gray-400 transition-colors font-bold text-sm mt-1"
                  >
                    <Plus className="w-4 h-4" /> Create New Flow
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { 
                      navigateTo('dashboard'); 
                      setTimeout(() => document.querySelector<HTMLInputElement>('input[placeholder="Search notes..."]')?.focus(), 100);
                      setOpenCommand(false); 
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-text-app/10 aria-selected:text-text-app text-gray-400 transition-colors font-bold text-sm"
                  >
                    <Search className="w-4 h-4" /> Search Flows...
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { setIsImportOpen(true); setOpenCommand(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-text-app/10 aria-selected:text-text-app text-gray-400 transition-colors font-bold text-sm"
                  >
                    <Upload className="w-4 h-4" /> Import Notes
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Navigation" className="text-xs font-black uppercase tracking-widest text-gray-500 p-2 pb-1 mt-2">
                  <Command.Item 
                    onSelect={() => { navigateTo('dashboard'); setOpenCommand(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-text-app/10 aria-selected:text-text-app text-gray-400 transition-colors font-bold text-sm mt-1"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { navigateTo('categories'); setOpenCommand(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-text-app/10 aria-selected:text-text-app text-gray-400 transition-colors font-bold text-sm"
                  >
                    <Tag className="w-4 h-4" /> Go to Categories
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => { navigateTo('settings'); setOpenCommand(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-text-app/10 aria-selected:text-text-app text-gray-400 transition-colors font-bold text-sm"
                  >
                    <Settings className="w-4 h-4" /> Go to Settings
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Preferences" className="text-xs font-black uppercase tracking-widest text-gray-500 p-2 pb-1 mt-2">
                  <Command.Item 
                    onSelect={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setOpenCommand(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-text-app/10 aria-selected:text-text-app text-gray-400 transition-colors font-bold text-sm mt-1"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>} 
                    Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      {/* Chatbot */}
      <AIChatbot notes={activeNotes} />
      
    </div>
  );
}

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [skipAuth, setSkipAuth] = useState(() => localStorage.getItem('skip_auth') === 'true');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for 'skip-auth' event from LoginPage guest button
  useEffect(() => {
    const handler = () => { setSkipAuth(true); localStorage.setItem('skip_auth', 'true'); };
    window.addEventListener('skip-auth', handler);
    return () => window.removeEventListener('skip-auth', handler);
  }, []);

  // Track online/offline
  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); };
  }, []);

  // Show loading spinner while Firebase checks auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#06070B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-[#FACC15] rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/30 animate-bounce">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-gray-500 font-bold text-sm">Loading StickyFlow...</p>
        </div>
      </div>
    );
  }

  // Show login if no user and not skipping auth
  if (!user && !skipAuth) {
    return <LoginPage />;
  }

  return <MainApp user={user} logout={logout} isOnline={isOnline} setSkipAuth={setSkipAuth} />;
}

export default App;
