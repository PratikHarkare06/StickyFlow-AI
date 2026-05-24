import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  type: 'created' | 'edited' | 'status_change' | 'shared' | 'attachment_added';
  content: string;
  timestamp: string;
}

export interface Note {
  id: string;
  content: string;
  category: string;
  color: string;
  timestamp: string;
  isPinned: boolean;
  isCompleted: boolean;
  isArchived: boolean;
  reminderDate?: string;
  subtasks?: Subtask[];
  status?: 'todo' | 'in-progress' | 'done';
  attachments?: Attachment[];
  activities?: Activity[];
  isTrashed?: boolean;
  trashedAt?: string;
  tags?: string[];
  recurrence?: { type: string; endDate?: string };
  linkedNoteIds?: string[];
  workspaceId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  progress: number;
}

export const STICKY_COLORS = {
  yellow: 'bg-[#FACC15] text-black',
  blue: 'bg-[#3B82F6] text-white',
  pink: 'bg-[#EC4899] text-white',
  green: 'bg-[#10B981] text-white',
  purple: 'bg-[#8B5CF6] text-white',
  orange: 'bg-[#F59E0B] text-black',
  cyan: 'bg-[#06B6D4] text-black',
};

export type View = 'dashboard' | 'completed' | 'archive' | 'categories' | 'settings' | 'reminders' | 'details' | 'pinned' | 'kanban' | 'analytics' | 'calendar' | 'trash';
