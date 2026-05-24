import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileUp, X, Image as ImageIcon, File, Loader2, Download, Trash2, Plus } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { Attachment, cn } from '../types';

interface AttachmentGalleryProps {
  noteId: string;
  attachments: Attachment[];
  onAdd: (noteId: string, attachment: Omit<Attachment, 'timestamp'>) => void;
  onRemove?: (noteId: string, attachmentId: string) => void;
}

export const AttachmentGallery: React.FC<AttachmentGalleryProps> = ({ noteId, attachments, onAdd }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const storageRef = ref(storage, `notes/${noteId}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      }, 
      (error) => {
        console.error('Upload failed', error);
        setUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onAdd(noteId, {
          id: Date.now().toString(),
          url: downloadURL,
          name: file.name,
          type: file.type
        });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Attachments</h3>
        <label className="cursor-pointer group">
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue/10 border border-accent-blue/30 rounded-xl text-accent-blue group-hover:bg-accent-blue group-hover:text-black transition-all">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-black uppercase tracking-widest">Attach</span>
          </div>
        </label>
      </div>

      {uploading && (
        <div className="bg-text-app/5 border border-border-app rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent-blue" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {attachments.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border-app rounded-3xl opacity-30">
          <FileUp className="w-8 h-8 mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest">Drag files here or click Attach</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {attachments.map((file) => (
          <motion.div 
            key={file.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-card-app border border-border-app rounded-2xl overflow-hidden aspect-square flex flex-col items-center justify-center p-4 hover:border-accent-blue/40 transition-all shadow-sm"
          >
            {file.type.startsWith('image/') ? (
              <img src={file.url} alt={file.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
            ) : (
              <File className="w-8 h-8 text-gray-500 mb-2" />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
              <p className="text-[10px] font-black text-white truncate w-full px-2">{file.name}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.open(file.url, '_blank')}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-xl text-white transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
