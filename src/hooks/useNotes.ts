import React, { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp,
  writeBatch, Timestamp, setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Note, Attachment } from '../types';

// ─── Default demo notes used when there's no Firestore data yet ───────────────
const DEFAULT_NOTES: Omit<Note, 'id'>[] = [
  {
    content: 'Complete the UI design for the new dashboard components by Friday.',
    category: 'Work', color: 'yellow', timestamp: new Date().toISOString(),
    isPinned: true, isCompleted: false, isArchived: false
  },
  {
    content: 'Buy a new ergonomic mouse and mechanical keyboard for the home office.',
    category: 'Personal', color: 'pink', timestamp: new Date().toISOString(),
    isPinned: false, isCompleted: false, isArchived: false
  },
  {
    content: 'Start a YouTube channel about Flutter development and design systems.',
    category: 'Ideas', color: 'blue', timestamp: new Date().toISOString(),
    isPinned: false, isCompleted: false, isArchived: false
  },
];

// ─── Cloud-backed hook ─────────────────────────────────────────────────────────
export function useNotes(userId?: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  // ── Undo history stack (up to 20 snapshots) ───────────────────────────────────
  const historyRef = React.useRef<Note[][]>([]);
  const pushHistory = (snapshot: Note[]) => {
    historyRef.current = [...historyRef.current.slice(-19), [...snapshot]];
  };

  // ── Real-time Firestore listener ──────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      // Fallback: load from localStorage when not authenticated
      const saved = localStorage.getItem('sticky_notes');
      setNotes(saved ? JSON.parse(saved) : DEFAULT_NOTES.map((n, i) => ({ ...n, id: String(i + 1) })));
      setLoading(false);
      return;
    }

    setLoading(true);
    const notesRef = collection(db, 'users', userId, 'notes');
    const q = query(notesRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Load any locally-persisted status overrides (resilient fallback)
      let localStatuses: Record<string, 'todo' | 'in-progress' | 'done'> = {};
      try {
        const raw = localStorage.getItem('kanban_status_overrides');
        if (raw) localStatuses = JSON.parse(raw);
      } catch {}

      const fetched: Note[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        // status comes from Firestore first, fall back to override, then default 'todo'
        const firestoreStatus = data.status as ('todo' | 'in-progress' | 'done') | undefined;
        const status = firestoreStatus ?? localStatuses[docSnap.id] ?? 'todo';
        return {
          id: docSnap.id,
          content: data.content ?? '',
          category: data.category ?? 'Personal',
          color: data.color ?? 'yellow',
          timestamp: data.timestamp instanceof Timestamp
            ? data.timestamp.toDate().toISOString()
            : data.timestamp ?? new Date().toISOString(),
          isPinned: data.isPinned ?? false,
          isCompleted: data.isCompleted ?? false,
          isArchived: data.isArchived ?? false,
          reminderDate: data.reminderDate ?? undefined,
          subtasks: data.subtasks ?? [],
          order: data.order ?? 0,
          status,
          attachments: data.attachments ?? [],
          activities: data.activities ?? [],
          isTrashed: data.isTrashed ?? false,
          trashedAt: data.trashedAt ?? undefined,
          tags: data.tags ?? [],
          recurrence: data.recurrence ?? undefined,
          linkedNoteIds: data.linkedNoteIds ?? [],
          workspaceId: data.workspaceId ?? 'default',
        };
      });

      // Seed with defaults on first run
      if (fetched.length === 0) {
        seedDefaults(userId);
      } else {
        setNotes(fetched);
      }
      setLoading(false);
    }, (err) => {
      console.error('Firestore listener error:', err);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  // ── Persist to localStorage as offline cache ─────────────────────────────────
  useEffect(() => {
    if (!userId) {
      localStorage.setItem('sticky_notes', JSON.stringify(notes));
    } else if (notes.length > 0) {
      localStorage.setItem('sticky_notes_cache', JSON.stringify(notes));
    }
  }, [notes, userId]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const notesRef = (uid: string) => collection(db, 'users', uid, 'notes');
  const noteRef = (uid: string, id: string) => doc(db, 'users', uid, 'notes', id);

  const seedDefaults = async (uid: string) => {
    setSyncing(true);
    const batch = writeBatch(db);
    DEFAULT_NOTES.forEach((note, i) => {
      const ref = doc(notesRef(uid));
      batch.set(ref, { ...note, timestamp: serverTimestamp(), order: i });
    });
    await batch.commit();
    setSyncing(false);
  };

  // ── Offline-friendly state updater + Firestore write ─────────────────────────
  const addNote = useCallback(async (content: string, category: string, color: string, reminderDate?: string, workspaceId?: string) => {
    const maxOrder = notes.reduce((m, n) => Math.max(m, (n as any).order ?? 0), -1);
    const tempId = `temp-${Date.now()}`;
    
    // Create new note with a temporary ID for immediate local render
    const newNote: Note = {
      id: tempId,
      content,
      category,
      color,
      timestamp: new Date().toISOString(),
      isPinned: false,
      isCompleted: false,
      isArchived: false,
      reminderDate: reminderDate || undefined,
      subtasks: [],
      workspaceId: workspaceId || 'default',
      status: 'todo',
      activities: [{
        id: Date.now().toString(),
        type: 'created',
        content: 'Note created',
        timestamp: new Date().toISOString()
      }]
    };

    // 1. Optimistic Update: Instantly render in the UI
    setNotes(prev => [newNote, ...prev]);

    if (userId) {
      setSyncing(true);
      
      const firestoreNote = { 
        content,
        category,
        color,
        timestamp: serverTimestamp(), 
        isPinned: false,
        isCompleted: false,
        isArchived: false,
        reminderDate: reminderDate || null,
        subtasks: [],
        workspaceId: workspaceId || 'default',
        status: 'todo',
        order: maxOrder + 1,
        activities: newNote.activities
      };
      
      const syncTimeout = setTimeout(() => setSyncing(false), 3000);
      
      try {
        await addDoc(collection(db, 'users', userId, 'notes'), firestoreNote);
      } catch (e) { 
        console.error('Error adding note to Firestore:', e);
        // Revert the optimistic update on error
        setNotes(prev => prev.filter(n => n.id !== tempId));
        throw e; // rethrow so calling components can handle the error
      } finally {
        clearTimeout(syncTimeout);
        setSyncing(false);
      }
    } else {
      // For guest/offline mode, persist the updated list to localStorage
      const saved = localStorage.getItem('sticky_notes');
      const localNotes = saved ? JSON.parse(saved) : [];
      localStorage.setItem('sticky_notes', JSON.stringify([newNote, ...localNotes]));
    }
  }, [userId, notes]);

  const updateStatus = useCallback(async (id: string, status: 'todo' | 'in-progress' | 'done') => {
    const isCompleted = status === 'done';
    // 1. Update local state immediately (optimistic)
    setNotes(prev => prev.map(n => n.id === id ? { ...n, status, isCompleted } : n));
    // 2. Persist to localStorage override map so snapshot can't revert it
    try {
      const raw = localStorage.getItem('kanban_status_overrides');
      const overrides = raw ? JSON.parse(raw) : {};
      overrides[id] = status;
      localStorage.setItem('kanban_status_overrides', JSON.stringify(overrides));
    } catch {}
    // 3. Push to Firestore
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { status, isCompleted, timestamp: serverTimestamp() }); }
      catch (e) { console.error('Error updating status in Firestore:', e); }
    }
  }, [userId]);

  const updateNote = useCallback(async (id: string, content: string, category: string, color: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, category, color, timestamp: new Date().toISOString() } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { content, category, color, timestamp: serverTimestamp() }); }
      catch (e) { console.error(e); }
    }
  }, [userId]);

  const deleteNote = useCallback(async (id: string) => {
    pushHistory(notes);
    // Soft-delete: move to trash
    const now = new Date().toISOString();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isTrashed: true, trashedAt: now } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { isTrashed: true, trashedAt: now }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const restoreNote = useCallback(async (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isTrashed: false, trashedAt: undefined } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { isTrashed: false, trashedAt: null }); }
      catch (e) { console.error(e); }
    }
  }, [userId]);

  const permanentDelete = useCallback(async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (userId) {
      try { await deleteDoc(noteRef(userId, id)); }
      catch (e) { console.error(e); }
    }
  }, [userId]);

  const emptyTrash = useCallback(async () => {
    const trashed = notes.filter(n => n.isTrashed);
    setNotes(prev => prev.filter(n => !n.isTrashed));
    if (userId && trashed.length > 0) {
      const batch = writeBatch(db);
      trashed.forEach(n => batch.delete(noteRef(userId, n.id)));
      try { await batch.commit(); } catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const togglePin = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { isPinned: !note.isPinned }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const toggleComplete = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    pushHistory(notes);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isCompleted: !n.isCompleted } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { isCompleted: !note.isCompleted }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const toggleArchive = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isArchived: !n.isArchived } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { isArchived: !note.isArchived }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const archiveAllCompleted = useCallback(async () => {
    const toArchive = notes.filter(n => n.isCompleted && !n.isArchived);
    pushHistory(notes);
    setNotes(prev => prev.map(n => n.isCompleted ? { ...n, isArchived: true } : n));
    if (userId && toArchive.length > 0) {
      const batch = writeBatch(db);
      toArchive.forEach(n => batch.update(noteRef(userId, n.id), { isArchived: true }));
      try { await batch.commit(); } catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const setReminder = useCallback(async (id: string, date: string | undefined) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, reminderDate: date } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { reminderDate: date ?? null }); }
      catch (e) { console.error(e); }
    }
  }, [userId]);

  const clearCompleted = useCallback(async () => {
    const toDelete = notes.filter(n => n.isCompleted);
    setNotes(prev => prev.filter(n => !n.isCompleted));
    if (userId && toDelete.length > 0) {
      const batch = writeBatch(db);
      toDelete.forEach(n => batch.delete(noteRef(userId, n.id)));
      try { await batch.commit(); } catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const addSubtask = useCallback(async (noteId: string, text: string) => {
    const newSubtask = { id: Date.now().toString(), text, isCompleted: false };
    setNotes(prev => prev.map(n => {
      if (n.id === noteId) return { ...n, subtasks: [...(n.subtasks || []), newSubtask] };
      return n;
    }));
    if (userId) {
      const note = notes.find(n => n.id === noteId);
      const updatedSubtasks = [...(note?.subtasks || []), newSubtask];
      try { await updateDoc(noteRef(userId, noteId), { subtasks: updatedSubtasks }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const toggleSubtask = useCallback(async (noteId: string, subtaskId: string) => {
    let updatedSubtasks: any[] = [];
    setNotes(prev => prev.map(n => {
      if (n.id === noteId && n.subtasks) {
        updatedSubtasks = n.subtasks.map(s => s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s);
        return { ...n, subtasks: updatedSubtasks };
      }
      return n;
    }));
    if (userId && updatedSubtasks.length > 0) {
      try { await updateDoc(noteRef(userId, noteId), { subtasks: updatedSubtasks }); }
      catch (e) { console.error(e); }
    }
  }, [userId]);

  const deleteSubtask = useCallback(async (noteId: string, subtaskId: string) => {
    let updatedSubtasks: any[] = [];
    setNotes(prev => prev.map(n => {
      if (n.id === noteId && n.subtasks) {
        updatedSubtasks = n.subtasks.filter(s => s.id !== subtaskId);
        return { ...n, subtasks: updatedSubtasks };
      }
      return n;
    }));
    if (userId) {
      const note = notes.find(n => n.id === noteId);
      updatedSubtasks = (note?.subtasks || []).filter(s => s.id !== subtaskId);
      try { await updateDoc(noteRef(userId, noteId), { subtasks: updatedSubtasks }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const reorderNotes = useCallback(async (oldIndex: number, newIndex: number) => {
    setNotes(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);

      // Persist new order to Firestore
      if (userId) {
        const batch = writeBatch(db);
        result.forEach((note: Note, idx) => {
          batch.update(noteRef(userId, note.id), { order: idx });
        });
        batch.commit().catch(console.error);
      }
      return result;
    });
  }, [userId]);

  // ── Undo last destructive action ─────────────────────────────────────────────
  const undoLast = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    setNotes(prev);
    // Re-sync to Firestore if online
    if (userId) {
      const batch = writeBatch(db);
      prev.forEach((note: Note) => {
        batch.set(noteRef(userId, note.id), {
          content: note.content,
          category: note.category,
          color: note.color,
          isPinned: note.isPinned,
          isCompleted: note.isCompleted,
          isArchived: note.isArchived,
          status: note.status ?? 'todo',
          subtasks: note.subtasks ?? [],
          order: (note as any).order ?? 0,
          reminderDate: note.reminderDate ?? null,
          timestamp: serverTimestamp(),
        });
      });
      batch.commit().catch(console.error);
    }
  }, [userId]);

  // ── Duplicate note ────────────────────────────────────────────────────────────
  const duplicateNote = useCallback(async (id: string) => {
    const src = notes.find(n => n.id === id);
    if (!src) return;
    const maxOrder = notes.reduce((m, n) => Math.max(m, (n as any).order ?? 0), -1);
    const newNote: Omit<Note, 'id'> = {
      ...src,
      content: src.content,
      isPinned: false,
      isCompleted: false,
      isArchived: false,
      timestamp: new Date().toISOString(),
      subtasks: (src.subtasks ?? []).map(s => ({ ...s, id: Math.random().toString(36).slice(2) })),
    };
    if (userId) {
      const firestoreNote = { ...newNote, timestamp: serverTimestamp(), order: maxOrder + 1, reminderDate: newNote.reminderDate ?? null };
      try { await addDoc(collection(db, 'users', userId, 'notes'), firestoreNote); }
      catch (e) { console.error('Error duplicating note:', e); }
    } else {
      setNotes(prev => [{ ...newNote, id: Date.now().toString() }, ...prev]);
    }
  }, [userId, notes]);

  // ── Activity Log ────────────────────────────────────────────────────────────
  const logActivity = useCallback(async (noteId: string, type: 'edited' | 'status_change' | 'shared' | 'attachment_added', content: string) => {
    const activity = { id: Date.now().toString(), type, content, timestamp: new Date().toISOString() };
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, activities: [activity, ...(n.activities || [])] } : n));
    if (userId) {
      const note = notes.find(n => n.id === noteId);
      const updated = [activity, ...(note?.activities || [])].slice(0, 50); // Keep last 50
      try { await updateDoc(noteRef(userId, noteId), { activities: updated }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  // ── Attachments ──────────────────────────────────────────────────────────────
  const addAttachment = useCallback(async (noteId: string, attachment: Omit<Attachment, 'timestamp'>) => {
    const fullAttachment = { ...attachment, timestamp: new Date().toISOString() };
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, attachments: [...(n.attachments || []), fullAttachment] } : n));
    if (userId) {
      const note = notes.find(n => n.id === noteId);
      const updated = [...(note?.attachments || []), fullAttachment];
      try { 
        await updateDoc(noteRef(userId, noteId), { attachments: updated });
        await logActivity(noteId, 'attachment_added', `Added attachment: ${attachment.name}`);
      } catch (e) { console.error(e); }
    }
  }, [userId, notes, logActivity]);
  // ── Tags ──────────────────────────────────────────────────────────────────────
  const addTag = useCallback(async (noteId: string, tag: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || note.tags?.includes(tag)) return;
    const updated = [...(note.tags || []), tag];
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, tags: updated } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, noteId), { tags: updated }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  const removeTag = useCallback(async (noteId: string, tag: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const updated = (note.tags || []).filter(t => t !== tag);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, tags: updated } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, noteId), { tags: updated }); }
      catch (e) { console.error(e); }
    }
  }, [userId, notes]);

  // Collect all unique tags across all notes
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(n => n.tags?.forEach(t => tagSet.add(t)));
    return [...tagSet].sort();
  }, [notes]);

  // ── Recurrence ────────────────────────────────────────────────────────────────
  const setRecurrence = useCallback(async (id: string, recurrence: { type: string; endDate?: string } | undefined) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, recurrence } : n));
    if (userId) {
      try { await updateDoc(noteRef(userId, id), { recurrence: recurrence ?? null }); }
      catch (e) { console.error(e); }
    }
  }, [userId]);

  // ── Bulk Import ───────────────────────────────────────────────────────────────
  const bulkImport = useCallback(async (importedNotes: Omit<Note, 'id'>[]) => {
    const maxOrder = notes.reduce((m, n) => Math.max(m, (n as any).order ?? 0), -1);
    
    if (userId) {
      setSyncing(true);
      const batch = writeBatch(db);
      importedNotes.forEach((note, i) => {
        const ref = doc(notesRef(userId));
        const firestoreNote = {
          ...note,
          timestamp: serverTimestamp(),
          order: maxOrder + 1 + i,
          activities: [{
            id: Date.now().toString(),
            type: 'created',
            content: 'Imported note',
            timestamp: new Date().toISOString()
          }]
        };
        // Firestore rejects undefined, clean up
        if (!firestoreNote.reminderDate) firestoreNote.reminderDate = null as any;
        batch.set(ref, firestoreNote);
      });
      try { await batch.commit(); }
      catch (e) { console.error('Bulk import error:', e); }
      finally { setSyncing(false); }
    } else {
      // Local mode
      const newNotes = importedNotes.map((n, i) => ({
        ...n,
        id: `imported-${Date.now()}-${i}`,
      }));
      setNotes(prev => [...newNotes, ...prev]);
    }
  }, [userId, notes]);

  return {
    notes, loading, syncing,
    addNote, updateNote, deleteNote,
    togglePin, toggleComplete, toggleArchive,
    archiveAllCompleted, setReminder, clearCompleted,
    updateStatus, undoLast, duplicateNote,
    addSubtask, toggleSubtask, deleteSubtask, reorderNotes,
    addAttachment, logActivity,
    restoreNote, permanentDelete, emptyTrash,
    addTag, removeTag, allTags,
    setRecurrence, bulkImport
  };
}
