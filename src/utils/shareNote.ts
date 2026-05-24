import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Note } from '../types';

export interface SharedNote {
  noteId: string;
  userId: string;
  content: string;
  category: string;
  color: string;
  createdAt: any;
  expiresAt: string; // ISO string, 7 days from creation
}

// Generate a share link for a note — stores a snapshot in Firestore
export async function shareNote(note: Note, userId: string): Promise<string> {
  const shareId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const shareData: SharedNote = {
    noteId: note.id,
    userId,
    content: note.content,
    category: note.category,
    color: note.color,
    createdAt: serverTimestamp(),
    expiresAt: expiresAt.toISOString(),
  };

  await setDoc(doc(db, 'shares', shareId), shareData);

  // Return the share URL — uses current origin
  return `${window.location.origin}/#share/${shareId}`;
}

// Fetch a shared note by share ID
export async function getSharedNote(shareId: string): Promise<SharedNote | null> {
  const snap = await getDoc(doc(db, 'shares', shareId));
  if (!snap.exists()) return null;
  const data = snap.data() as SharedNote;
  // Check if expired
  if (new Date(data.expiresAt) < new Date()) return null;
  return data;
}
