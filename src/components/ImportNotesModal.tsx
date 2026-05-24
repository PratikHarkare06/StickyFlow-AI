import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileJson, FileText, X, Plus, CheckCircle2, AlertCircle, File, ArrowRight } from 'lucide-react';
import { cn, Note } from '../types';
import { readFileContent, parseImport } from '../utils/importNotes';

interface ImportNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (notes: Omit<Note, 'id'>[]) => void;
}

type ImportStep = 'select' | 'preview' | 'success';

export const ImportNotesModal: React.FC<ImportNotesModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState<ImportStep>('select');
  const [parsedNotes, setParsedNotes] = useState<Omit<Note, 'id'>[]>([]);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('select');
    setParsedNotes([]);
    setError('');
    setFileName('');
    setIsDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = useCallback(async (file: File) => {
    setError('');
    setFileName(file.name);
    try {
      const content = await readFileContent(file);
      const notes = parseImport(content, file.name);
      if (notes.length === 0) {
        setError('No notes found in the file');
        return;
      }
      setParsedNotes(notes);
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleImport = () => {
    onImport(parsedNotes);
    setStep('success');
    setTimeout(handleClose, 1500);
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="bg-card-app border border-border-app rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border-app">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent-blue/10 rounded-xl">
                <Upload className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-sm font-black text-text-app">Import Notes</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {step === 'select' ? 'Choose a file' : step === 'preview' ? `${parsedNotes.length} notes found` : 'Done!'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-500 hover:text-text-app rounded-xl hover:bg-text-app/5 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'select' && (
              <div className="space-y-4">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
                    isDragging
                      ? "border-accent-blue bg-accent-blue/5 scale-[1.02]"
                      : "border-border-app hover:border-accent-blue/40 hover:bg-text-app/3"
                  )}
                >
                  <Upload className={cn("w-10 h-10 mx-auto mb-4", isDragging ? "text-accent-blue" : "text-gray-600")} />
                  <p className="text-sm font-black text-text-app mb-1">
                    {isDragging ? 'Drop it here!' : 'Drop file or click to browse'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Supports JSON · Markdown · Plain Text
                  </p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,.md,.markdown,.txt,.text"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Format guide */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: FileJson, label: 'JSON', desc: 'Array of note objects' },
                    { icon: FileText, label: 'Markdown', desc: 'Headings as notes' },
                    { icon: File, label: 'Text', desc: 'Paragraphs as notes' },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="p-3 rounded-xl bg-text-app/3 border border-border-app text-center">
                      <Icon className="w-5 h-5 mx-auto text-gray-500 mb-1.5" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-app">{label}</p>
                      <p className="text-[8px] font-bold text-gray-600 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">{error}</span>
                  </div>
                )}
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                {/* File info */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-text-app/3 border border-border-app">
                  <FileJson className="w-5 h-5 text-accent-blue" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-text-app">{fileName}</p>
                    <p className="text-[9px] font-bold text-gray-500">{parsedNotes.length} note{parsedNotes.length !== 1 ? 's' : ''} ready to import</p>
                  </div>
                </div>

                {/* Preview cards */}
                <div className="max-h-[220px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {parsedNotes.map((note, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-text-app/3 border border-border-app">
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1 shrink-0",
                        note.color === 'blue' ? 'bg-blue-500' :
                        note.color === 'pink' ? 'bg-pink-500' :
                        note.color === 'green' ? 'bg-green-500' :
                        note.color === 'purple' ? 'bg-purple-500' : 'bg-yellow-500'
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-text-app line-clamp-2">{stripHtml(note.content)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{note.category}</span>
                          {(note.subtasks?.length ?? 0) > 0 && (
                            <span className="text-[8px] font-bold text-gray-600">{note.subtasks?.length} subtasks</span>
                          )}
                          {(note.tags?.length ?? 0) > 0 && (
                            <span className="text-[8px] font-bold text-gray-600">{note.tags?.length} tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl border border-border-app text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-text-app/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex-1 py-3 rounded-xl bg-accent-blue text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    Import {parsedNotes.length} Note{parsedNotes.length !== 1 ? 's' : ''}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
                </motion.div>
                <p className="text-sm font-black text-text-app">Import Complete!</p>
                <p className="text-[10px] font-bold text-gray-500 mt-1">
                  {parsedNotes.length} note{parsedNotes.length !== 1 ? 's' : ''} added to your workspace
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
