import React from 'react';
import { ArrowLeft, Trash, Pin, Clock, CheckCircle2, Edit3, Sparkles, Download, X, Loader2, Maximize2, Tag, Calendar, Share2, ClipboardCheck, Link, Hash, Repeat } from 'lucide-react';

import { Note, STICKY_COLORS, cn } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextEditor } from '../components/RichTextEditor';
import { FocusMode } from '../components/FocusMode';
import { exportPDF, exportJSON, exportCSV } from '../utils/exportNotes';
import { shareNote } from '../utils/shareNote';
import { useAuth } from '../contexts/AuthContext';
import { AttachmentGallery } from '../components/AttachmentGallery';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { TagManager } from '../components/TagManager';
import { RecurrencePicker, RecurrenceConfig } from '../components/RecurrencePicker';
import { BacklinksPanel } from '../components/NoteLinks';
import { Attachment } from '../types';

interface TaskDetailsPageProps {
  note: Note | undefined;
  onDeleteNote: (id: string) => void;
  onPinNote: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onSetReminder: (id: string, date: string | undefined) => void;
  onUpdateNote: (id: string, content: string, category: string, color: string) => void;
  onAddSubtask: (noteId: string, text: string) => void;
  onToggleSubtask: (noteId: string, subtaskId: string) => void;
  onDeleteSubtask: (noteId: string, subtaskId: string) => void;
  onBack: () => void;
  onAddAttachment: (noteId: string, attachment: Omit<Attachment, 'timestamp'>) => void;
  onLogActivity: (noteId: string, type: 'edited' | 'status_change' | 'shared' | 'attachment_added', content: string) => void;
  onAddTag: (noteId: string, tag: string) => void;
  onRemoveTag: (noteId: string, tag: string) => void;
  allTags: string[];
  onSetRecurrence: (id: string, recurrence: { type: string; endDate?: string } | undefined) => void;
  allNotes: Note[];
  onNoteNavigate: (id: string) => void;
}

export const TaskDetailsPage: React.FC<TaskDetailsPageProps> = ({ 
  note, 
  onDeleteNote, 
  onPinNote, 
  onToggleComplete,
  onToggleArchive,
  onSetReminder,
  onUpdateNote,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onBack,
  onAddAttachment,
  onLogActivity,
  onAddTag,
  onRemoveTag,
  allTags,
  onSetRecurrence,
  allNotes,
  onNoteNavigate
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState('');
  const [editCategory, setEditCategory] = React.useState('');
  const [newSubtaskText, setNewSubtaskText] = React.useState('');
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  // Initialize edit state when entering edit mode or note changes
  React.useEffect(() => {
    if (note) {
      setEditContent(note.content);
      setEditCategory(note.category);
    }
  }, [note, isEditing]);

  const CATEGORIES = [
    { name: 'Work', color: 'yellow' },
    { name: 'Personal', color: 'pink' },
    { name: 'Ideas', color: 'blue' },
    { name: 'Urgent', color: 'cyan' },
  ];

  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);
  const [showFocusMode, setShowFocusMode] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [shareLoading, setShareLoading] = React.useState(false);
  const { user } = useAuth();

  const handleSaveEdit = () => {
    if (!note || !editContent.trim()) return;
    const catObj = CATEGORIES.find(c => c.name === editCategory);
    onUpdateNote(note.id, editContent, editCategory, catObj?.color || note.color);
    setIsEditing(false);
  };

  const handleAISummarize = async () => {
    if (!note) return;

    const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY?.replace(/['"]/g, '');
    if (!nvidiaKey) {
      setAiSummary('🔑 No NVIDIA API key found.\n\nAdd VITE_NVIDIA_API_KEY to your .env.local file.');
      return;
    }

    setAiLoading(true);
    setAiSummary(null);
    try {
      const plainText = new DOMParser().parseFromString(note.content, 'text/html').body.textContent || '';
      if (!plainText.trim()) {
        setAiSummary('📝 This note has no text content to summarize.');
        return;
      }

      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: "stepfun-ai/step-3.5-flash",
          messages: [{ role: "user", content: `Summarize the following note into 3-5 concise bullet points. Be direct and actionable. Use bullet point symbols (•). Note content: "${plainText}"` }],
          temperature: 0.3,
          top_p: 0.95,
          max_tokens: 8192,
          stream: false
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error?.message ?? res.statusText;
        setAiSummary(`⚠️ API Error: ${errMsg}`);
        return;
      }

      const text = data?.choices?.[0]?.message?.content;
      setAiSummary(text ?? '⚠️ No summary returned. Try again.');
    } catch (e: any) {
      setAiSummary(`⚠️ Network error: ${e.message ?? 'Check your internet connection.'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const [showAiMenu, setShowAiMenu] = React.useState(false);

  const handleAIExtractActionItems = async () => {
    if (!note) return;
    const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY?.replace(/['"]/g, '');
    if (!nvidiaKey) {
      setAiSummary('🔑 No NVIDIA API key found.');
      return;
    }
    setAiLoading(true);
    setAiSummary(null);
    setShowAiMenu(false);
    try {
      const plainText = new DOMParser().parseFromString(note.content, 'text/html').body.textContent || '';
      if (!plainText.trim()) {
        setAiSummary('📝 This note has no text content.');
        return;
      }
      
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: "stepfun-ai/step-3.5-flash",
          messages: [{ role: "user", content: `Extract up to 5 clear action items from the following note. Return ONLY a JSON array of strings, nothing else. Note content: "${plainText}"` }],
          temperature: 0.1,
          top_p: 0.95,
          max_tokens: 8192,
          stream: false
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errMsg = data?.error?.message ?? res.statusText;
        setAiSummary(`⚠️ API Error: ${errMsg}`);
        return;
      }

      const text = data?.choices?.[0]?.message?.content;
      if (text) {
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch) {
          const items = JSON.parse(jsonMatch[0]);
          items.forEach((item: string) => {
            onAddSubtask(note.id, item);
          });
          setAiSummary(`✅ Extracted ${items.length} action items into subtasks!`);
        } else {
          setAiSummary('⚠️ AI did not return a valid list.');
        }
      }
    } catch (e: any) {
      setAiSummary(`⚠️ Error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAICategorize = async () => {
    if (!note) return;
    const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY?.replace(/['"]/g, '');
    if (!nvidiaKey) {
      setAiSummary('🔑 No NVIDIA API key found.');
      return;
    }
    setAiLoading(true);
    setAiSummary(null);
    setShowAiMenu(false);
    try {
      const plainText = new DOMParser().parseFromString(note.content, 'text/html').body.textContent || '';
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${nvidiaKey}`
        },
        body: JSON.stringify({
          model: "stepfun-ai/step-3.5-flash",
          messages: [{ role: "user", content: `Categorize the following note into EXACTLY ONE of these categories: Work, Personal, Ideas, Urgent. Return ONLY the category name. Note content: "${plainText}"` }],
          temperature: 0.1,
          top_p: 0.95,
          max_tokens: 8192,
          stream: false
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errMsg = data?.error?.message ?? res.statusText;
        setAiSummary(`⚠️ API Error: ${errMsg}`);
        return;
      }

      let text = data?.choices?.[0]?.message?.content?.trim();
      if (text) text = text.replace(/['".]/g, ''); // Remove punctuation
      if (text && CATEGORIES.some(c => c.name === text)) {
        const catObj = CATEGORIES.find(c => c.name === text);
        onUpdateNote(note.id, note.content, text, catObj?.color || note.color);
        setAiSummary(`✅ Automatically categorized as ${text}!`);
      } else {
        setAiSummary(`⚠️ Could not determine a clear category from text. AI said: ${text}`);
      }
    } catch (e: any) {
      setAiSummary(`⚠️ Error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleShare = async () => {
    if (!note || !user) return;
    setShareLoading(true);
    try {
      const url = await shareNote(note, user.uid);
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      onLogActivity(note.id, 'shared', 'Shared public link generated');
      setTimeout(() => setShareUrl(null), 5000); // Reset state after 5s
    } catch (e) {
      console.error('Share failed', e);
    } finally {
      setShareLoading(false);
    }
  };


  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-8">
        <div className="w-24 h-24 rounded-full bg-text-app/5 flex items-center justify-center text-gray-500">
          <Clock className="w-10 h-10 opacity-20" />
        </div>
        <p className="text-gray-500 font-bold text-center tracking-widest uppercase">Select a flow to view details</p>
        <button onClick={onBack} className="text-accent-blue font-black underline tracking-tighter uppercase">Go back to workspace</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 lg:space-y-10 pb-32 pt-16 lg:pt-20">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 lg:pr-[360px]">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-text-app/60 hover:text-text-app transition-colors group"
        >
          <div className="p-2 border border-border-app rounded-xl group-hover:border-accent-blue/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Workspace</span>
        </button>

        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto flex-wrap">
          <button 
            onClick={() => onPinNote(note.id)}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              note.isPinned ? "border-sticky-yellow bg-sticky-yellow/10 text-sticky-yellow shadow-lg shadow-yellow-400/10" : "border-border-app text-gray-500 hover:border-gray-500"
            )}
          >
            <Pin className="w-5 h-5" />
          </button>
          {/* Focus Mode */}
          <button
            onClick={() => setShowFocusMode(true)}
            title="Focus Mode (distraction-free)"
            className="p-3 border border-border-app rounded-2xl text-gray-500 hover:border-accent-blue/40 hover:text-accent-blue transition-all"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          {/* Public Share */}
          <button
            onClick={handleShare}
            disabled={shareLoading || !user}
            title="Share snapshot via link"
            className={cn(
              "p-3 border rounded-2xl transition-all relative overflow-hidden",
              shareUrl 
                ? "bg-accent-blue/10 border-accent-blue text-accent-blue" 
                : "border-border-app text-gray-500 hover:border-accent-blue/40"
            )}
          >
            {shareLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : shareUrl ? (
              <ClipboardCheck className="w-5 h-5" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>
          <button 
            onClick={() => onDeleteNote(note.id)}
            className="p-3 border border-border-app rounded-2xl text-gray-500 hover:border-sticky-pink hover:text-sticky-pink transition-all"
          >
            <Trash className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onToggleComplete(note.id)}
            className={cn(
              "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3",
              note.isCompleted ? "bg-accent-blue text-black" : "bg-text-app/5 text-gray-500 hover:bg-text-app/10"
            )}
          >
            {note.isCompleted ? (
              <><CheckCircle2 className="w-5 h-5 stroke-[2.5px]" />Completed</>
            ) : (
              <><div className="w-5 h-5 rounded-full border-2 border-current" />Mark Complete</>
            )}
          </button>

          {/* AI Magic Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAiMenu(v => !v)}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-all font-black text-xs disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Magic
            </button>
            <AnimatePresence>
              {showAiMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute right-0 top-14 bg-card-app border border-border-app rounded-2xl p-2 shadow-2xl z-50 min-w-[200px]"
                >
                  <button
                    onClick={() => { setShowAiMenu(false); handleAISummarize(); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-500/10 hover:text-violet-400 transition-colors flex items-center gap-2"
                  >
                    📝 Summarize
                  </button>
                  <button
                    onClick={handleAIExtractActionItems}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-500/10 hover:text-violet-400 transition-colors flex items-center gap-2"
                  >
                    ✅ Extract Action Items
                  </button>
                  <button
                    onClick={handleAICategorize}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-500/10 hover:text-violet-400 transition-colors flex items-center gap-2"
                  >
                    🏷️ Auto-Categorize
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExport(v => !v)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border-app text-gray-500 hover:border-accent-blue/30 hover:text-accent-blue transition-all font-black text-xs"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <AnimatePresence>
              {showExport && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute right-0 top-14 bg-card-app border border-border-app rounded-2xl p-2 shadow-2xl z-50 min-w-[150px]"
                >
                  {(['PDF', 'JSON', 'CSV'] as const).map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => {
                        if (fmt === 'PDF') exportPDF([note]);
                        if (fmt === 'JSON') exportJSON([note]);
                        if (fmt === 'CSV') exportCSV([note]);
                        setShowExport(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-text-app/5 transition-colors"
                    >
                      Download as {fmt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>


      {/* AI Summary Panel */}
      <AnimatePresence>
        {aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-5 relative"
          >
            <button onClick={() => setAiSummary(null)} className="absolute top-3 right-3 text-gray-500 hover:text-text-app"><X className="w-4 h-4" /></button>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-black uppercase tracking-widest text-violet-400">AI Summary</span>
            </div>
            <p className="text-sm text-text-app leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={cn(
            "rounded-[2.5rem] p-10 lg:p-14 shadow-2xl relative group overflow-hidden min-h-[300px] transition-colors duration-300",
            STICKY_COLORS[(isEditing ? CATEGORIES.find(c => c.name === editCategory)?.color : note.color) as keyof typeof STICKY_COLORS] || STICKY_COLORS.yellow
          )}>
            <div className="absolute top-0 right-0 p-14 opacity-5 pointer-events-none">
              <Edit3 className="w-64 h-64" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-4 flex-wrap">
                  {isEditing ? (
                    CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => setEditCategory(cat.name)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          editCategory === cat.name ? "bg-white text-black shadow-lg" : "bg-black/10 text-white hover:bg-black/20"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))
                  ) : (
                    <span className="px-4 py-1.5 rounded-full bg-black/10 text-[10px] font-black uppercase tracking-widest text-white">
                      {note.category}
                    </span>
                  )}
                  {!isEditing && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      {note.timestamp}
                    </span>
                  )}
                </div>
                
                {isEditing ? (
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    editable={true}
                    className="text-2xl lg:text-3xl leading-snug"
                  />
                ) : (
                  <RichTextEditor
                    content={note.content}
                    onChange={() => {}}
                    editable={false}
                    className="text-2xl lg:text-3xl leading-snug"
                  />
                )}
              </div>
              <div className="flex items-center gap-6">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                      className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Save Flow</span>
                    </button>
                    <button 
                      onClick={() => {
                        setEditContent(note.content);
                        setEditCategory(note.category);
                        setIsEditing(false);
                      }}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-4 py-2.5"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Edit Flow</span>
                    </button>
                  </>
                )}
                {/* Word/Char count */}
                {(() => {
                  const text = new DOMParser().parseFromString(isEditing ? editContent : note.content, 'text/html').body.textContent || '';
                  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
                  const chars = text.length;
                  const readMins = Math.max(1, Math.ceil(words / 200));
                  return (
                    <span className="text-[10px] font-bold text-white/30 ml-auto">
                      {words}w · {chars}c · {readMins}min read
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="bg-card-app border border-border-app rounded-[2rem] p-10 space-y-8 shadow-xl">
            <h3 className="text-xl font-black mb-8 p-1">Subtasks & Progress</h3>
            <div className="space-y-4">
              {note.subtasks?.map(sub => (
                <div key={sub.id} className="flex items-center gap-5 p-5 bg-text-app/5 border border-transparent rounded-[1.25rem] hover:bg-black/5 hover:border-border-app/50 transition-all cursor-pointer group">
                  <button 
                    onClick={() => onToggleSubtask(note.id, sub.id)}
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      sub.isCompleted ? "bg-accent-blue border-accent-blue text-black" : "border-border-app group-hover:border-accent-blue"
                    )}
                  >
                    {sub.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <p className={cn(
                    "font-bold flex-1 transition-all",
                    sub.isCompleted ? "text-gray-600 line-through" : "text-text-app"
                  )}>
                    {sub.text}
                  </p>
                  <button 
                    onClick={() => onDeleteSubtask(note.id, sub.id)}
                    className="p-2 text-gray-700 hover:text-sticky-pink opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {isAddingSubtask ? (
                <div className="p-4 bg-black/5 border border-accent-blue/30 rounded-2xl flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Enter subtask details..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSubtaskText.trim()) {
                        onAddSubtask(note.id, newSubtaskText);
                        setNewSubtaskText('');
                        setIsAddingSubtask(false);
                      }
                      if (e.key === 'Escape') setIsAddingSubtask(false);
                    }}
                    className="bg-transparent border-none focus:outline-none font-bold text-text-app placeholder:text-gray-500"
                  />
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setIsAddingSubtask(false)}
                      className="text-[10px] font-black uppercase text-gray-500 hover:text-text-app transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (newSubtaskText.trim()) {
                          onAddSubtask(note.id, newSubtaskText);
                          setNewSubtaskText('');
                          setIsAddingSubtask(false);
                        }
                      }}
                      className="text-[10px] font-black uppercase text-accent-blue hover:text-blue-400 transition-colors"
                    >
                      Confirm Flow
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingSubtask(true)}
                  className="w-full py-5 border-2 border-dashed border-border-app rounded-[1.5rem] text-gray-500 font-black uppercase tracking-widest hover:border-accent-blue hover:text-accent-blue transition-all"
                >
                  + Add Subtask
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Flow Metadata</h3>
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shadow-inner">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</p>
                  <p className="text-sm font-black text-text-app">{note.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-sticky-pink/10 flex items-center justify-center text-sticky-pink shadow-inner group-hover:bg-sticky-pink group-hover:text-black transition-all">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Set Reminder</p>
                  <input 
                    type="date" 
                    value={note.reminderDate || ''}
                    onChange={(e) => onSetReminder(note.id, e.target.value || undefined)}
                    className="bg-transparent text-sm font-black text-text-app focus:outline-none w-full appearance-none"
                  />
                </div>
                {note.reminderDate && (
                  <button 
                    onClick={() => onSetReminder(note.id, undefined)}
                    className="p-2 text-sticky-pink hover:bg-sticky-pink/10 rounded-lg transition-colors"
                    title="Clear Reminder"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Recurrence picker */}
              {note.reminderDate && (
                <div className="flex items-center gap-4 pl-16">
                  <RecurrencePicker
                    value={(note.recurrence as RecurrenceConfig) || { type: 'none' }}
                    onChange={(config) => onSetRecurrence(note.id, config.type === 'none' ? undefined : config)}
                    reminderDate={note.reminderDate}
                    compact
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sticky-yellow/10 flex items-center justify-center text-sticky-yellow shadow-inner">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Activity</p>
                  <p className="text-sm font-black text-text-app">{note.timestamp}</p>
                </div>
              </div>
            </div>
          </div>

            <button 
              onClick={() => onToggleArchive(note.id)}
              className="w-full py-5 bg-card-app border border-border-app rounded-2xl text-gray-500 font-black uppercase tracking-widest hover:bg-sticky-cyan hover:text-black hover:border-sticky-cyan transition-all shadow-xl"
            >
              Vault Archive
            </button>

            <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl">
              <TagManager
                tags={note.tags || []}
                allTags={allTags}
                onAddTag={(tag) => onAddTag(note.id, tag)}
                onRemoveTag={(tag) => onRemoveTag(note.id, tag)}
              />
            </div>

            <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl">
              <BacklinksPanel
                note={note}
                allNotes={allNotes}
                onNoteClick={onNoteNavigate}
              />
            </div>

            <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl">
              <AttachmentGallery 
                noteId={note.id} 
                attachments={note.attachments || []} 
                onAdd={onAddAttachment} 
              />
            </div>

            <div className="bg-card-app border border-border-app rounded-[2rem] p-8 shadow-xl">
              <ActivityTimeline activities={note.activities || []} />
            </div>
          </div>
        </div>

      {/* Focus Mode overlay */}
      <FocusMode
        note={note}
        isOpen={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        onSave={(content) => {
          const catObj = CATEGORIES.find(c => c.name === note.category);
          onUpdateNote(note.id, content, note.category, catObj?.color || note.color);
        }}
      />
    </div>
  );
};
