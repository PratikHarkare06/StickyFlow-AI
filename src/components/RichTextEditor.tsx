import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { cn } from '../types';
import { Bold, Italic, List, ListOrdered, CheckSquare, Strikethrough, Quote, Code } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  editable = true,
  placeholder = 'Start writing your flow...',
  className,
  minHeight = '150px'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose max-w-none focus:outline-none font-bold text-text-app',
          className
        ),
        style: `min-height: ${minHeight};`,
      },
    },
  });

  // Since Tiptap doesn't immediately update content state externally well without careful handling, 
  // we update it when 'content' prop changes deeply if the editor isn't focused.
  React.useEffect(() => {
    if (editor && !editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Toolbar only visible when editable
  return (
    <div className="flex flex-col gap-4 w-full relative">
      {editable && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-text-app/5 rounded-2xl border border-border-app/40 backdrop-blur-md">
          <MenuButton
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            icon={<Bold className="w-4 h-4" />}
            title="Bold (Cmd+B)"
          />
          <MenuButton
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            icon={<Italic className="w-4 h-4" />}
            title="Italic (Cmd+I)"
          />
          <MenuButton
            isActive={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            icon={<Strikethrough className="w-4 h-4" />}
            title="Strikethrough"
          />
          <div className="w-px h-5 bg-border-app/40 mx-1" />
          <MenuButton
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            icon={<List className="w-4 h-4" />}
            title="Bullet List"
          />
          <MenuButton
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            icon={<ListOrdered className="w-4 h-4" />}
            title="Numbered List"
          />
          <MenuButton
            isActive={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            icon={<CheckSquare className="w-4 h-4" />}
            title="Task List"
          />
          <div className="w-px h-5 bg-border-app/40 mx-1" />
          <MenuButton
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            icon={<Quote className="w-4 h-4" />}
            title="Quote"
          />
          <MenuButton
            isActive={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            icon={<Code className="w-4 h-4" />}
            title="Code Block"
          />
        </div>
      )}
      <div className={cn("w-full transition-all", editable ? "opacity-100" : "opacity-100")}>
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
};

interface MenuButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ isActive, onClick, icon, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "p-2 rounded-xl transition-all cursor-pointer",
      isActive 
        ? "bg-text-app text-bg-app shadow-lg scale-105 font-bold" 
        : "text-text-app/60 hover:text-text-app hover:bg-text-app/10 active:scale-95"
    )}
    type="button"
  >
    {icon}
  </button>
);
