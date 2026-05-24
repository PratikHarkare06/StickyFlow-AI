import { Note } from '../types';

// ── Parse JSON import ─────────────────────────────────────────────────────────
export const parseJSONImport = (text: string): Omit<Note, 'id'>[] => {
  try {
    const parsed = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items.map(item => ({
      content: item.content || item.text || item.body || item.title || '',
      category: item.category || item.folder || item.label || 'Personal',
      color: item.color || 'yellow',
      timestamp: item.timestamp || item.created || item.date || new Date().toISOString(),
      isPinned: item.isPinned ?? item.pinned ?? false,
      isCompleted: item.isCompleted ?? item.completed ?? item.done ?? false,
      isArchived: item.isArchived ?? item.archived ?? false,
      subtasks: (item.subtasks || item.tasks || item.checklist || []).map((s: any, i: number) => ({
        id: `imported-${Date.now()}-${i}`,
        text: typeof s === 'string' ? s : s.text || s.title || '',
        isCompleted: typeof s === 'string' ? false : s.isCompleted ?? s.completed ?? s.done ?? false,
      })),
      tags: item.tags || item.labels || [],
      status: item.status || 'todo',
    }));
  } catch {
    throw new Error('Invalid JSON format');
  }
};

// ── Parse Markdown import ────────────────────────────────────────────────────
export const parseMarkdownImport = (text: string): Omit<Note, 'id'>[] => {
  // Split by --- or thematic breaks, or treat each H1/H2 as a separate note
  const sections = text.split(/^---+$/m).filter(s => s.trim());
  
  if (sections.length <= 1) {
    // Try splitting by headings
    const headingSections = text.split(/^(?=#{1,2}\s)/m).filter(s => s.trim());
    if (headingSections.length > 1) {
      return headingSections.map(section => markdownToNote(section));
    }
  }

  if (sections.length > 1) {
    return sections.map(section => markdownToNote(section));
  }

  // Single note
  return [markdownToNote(text)];
};

const markdownToNote = (md: string): Omit<Note, 'id'> => {
  const lines = md.trim().split('\n');
  let title = '';
  const contentLines: string[] = [];
  const subtasks: { id: string; text: string; isCompleted: boolean }[] = [];
  const tags: string[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // Extract title from first heading
    if (!title && /^#{1,2}\s/.test(trimmed)) {
      title = trimmed.replace(/^#{1,2}\s+/, '');
      return;
    }
    // Extract checklist items as subtasks
    if (/^[-*]\s*\[[ x]\]/.test(trimmed)) {
      const isChecked = /\[x\]/i.test(trimmed);
      const taskText = trimmed.replace(/^[-*]\s*\[[ x]\]\s*/, '');
      subtasks.push({ id: `imp-${Date.now()}-${i}`, text: taskText, isCompleted: isChecked });
      return;
    }
    // Extract hashtag-style tags
    const tagMatches = trimmed.match(/#(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach(tag => {
        const clean = tag.replace('#', '').toLowerCase();
        if (!tags.includes(clean) && clean.length > 1) tags.push(clean);
      });
    }
    contentLines.push(line);
  });

  const content = title
    ? `<h2>${title}</h2><p>${contentLines.join('\n').trim()}</p>`
    : `<p>${contentLines.join('\n').trim()}</p>`;

  // Try to detect category from tags
  const categoryMap: Record<string, string> = {
    work: 'Work', personal: 'Personal', idea: 'Ideas', ideas: 'Ideas',
    urgent: 'Urgent', project: 'Work', meeting: 'Work',
  };
  const detectedCategory = tags.find(t => categoryMap[t]);
  const category = detectedCategory ? categoryMap[detectedCategory] : 'Personal';

  return {
    content,
    category,
    color: 'yellow',
    timestamp: new Date().toISOString(),
    isPinned: false,
    isCompleted: false,
    isArchived: false,
    subtasks: subtasks.length > 0 ? subtasks : [],
    tags: tags.filter(t => !categoryMap[t]), // exclude category-mapped tags
    status: 'todo',
  };
};

// ── Parse plain text import ──────────────────────────────────────────────────
export const parsePlainTextImport = (text: string): Omit<Note, 'id'>[] => {
  // Split by double newlines
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim());

  if (paragraphs.length === 0) throw new Error('No content found');

  return paragraphs.map(para => ({
    content: `<p>${para.trim()}</p>`,
    category: 'Personal',
    color: 'yellow',
    timestamp: new Date().toISOString(),
    isPinned: false,
    isCompleted: false,
    isArchived: false,
    subtasks: [],
    tags: [],
    status: 'todo' as const,
  }));
};

// ── File reader helper ───────────────────────────────────────────────────────
export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// ── Auto-detect format and parse ─────────────────────────────────────────────
export const parseImport = (content: string, filename: string): Omit<Note, 'id'>[] => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json':
      return parseJSONImport(content);
    case 'md':
    case 'markdown':
      return parseMarkdownImport(content);
    case 'txt':
    default:
      // Try JSON first
      try { return parseJSONImport(content); } catch {}
      // Then try markdown
      if (content.includes('#') || content.includes('- [')) {
        return parseMarkdownImport(content);
      }
      return parsePlainTextImport(content);
  }
};
