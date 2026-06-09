import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from './extensions/CustomImage';
import { CustomVideo } from './extensions/CustomVideo';
import Link from '@tiptap/extension-link';
import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1,
  Heading2,
  Strikethrough,
  Code
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface RichTextEditorRef {
  insertImage: (url: string) => void;
  insertVideo: (url: string) => void;
  insertLink: (url: string, title: string) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        CustomImage,
        CustomVideo,
        Link.configure({ openOnClick: false }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none max-w-none min-h-[300px] p-6 text-sm text-foreground',
        },
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage: (url: string) => {
        if (editor) {
          editor.commands.insertContent(`<img src="${url}" />`);
        }
      },
      insertVideo: (url: string) => {
        if (editor) {
          editor.commands.insertContent(`<iframe src="${url}"></iframe>`);
        }
      },
      insertLink: (url: string, title: string) => {
        if (editor) {
          editor.chain().focus().setLink({ href: url }).insertContent(title).run();
        }
      }
    }));

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        const currentSelection = editor.state.selection;
        editor.commands.setContent(value);
        editor.commands.setTextSelection(currentSelection);
      }
    }, [value, editor]);

    if (!editor) {
      return null;
    }

    const ToolbarButton = ({ 
      isActive, 
      onClick, 
      children 
    }: { 
      isActive?: boolean; 
      onClick: () => void; 
      children: React.ReactNode;
    }) => (
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`p-2 rounded-md hover:bg-card hover:shadow-sm transition-all ${
          isActive ? 'bg-card shadow-sm text-blue-600' : 'text-gray-400 hover:text-blue-600'
        }`}
      >
        {children}
      </button>
    );

    return (
      <div className={`border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-card flex flex-col ${className || ''}`}>
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted border-b border-gray-100 shrink-0">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')}
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')}
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            isActive={editor.isActive('strike')}
          >
            <Strikethrough size={16} />
          </ToolbarButton>
          
          <div className="w-[1px] h-6 bg-gray-200 mx-1" />
          
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            isActive={editor.isActive('heading', { level: 1 })}
          >
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            isActive={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 size={16} />
          </ToolbarButton>
          
          <div className="w-[1px] h-6 bg-gray-200 mx-1" />
          
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            isActive={editor.isActive('bulletList')}
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            isActive={editor.isActive('orderedList')}
          >
            <ListOrdered size={16} />
          </ToolbarButton>
          
          <div className="w-[1px] h-6 bg-gray-200 mx-1" />
          
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleCode().run()} 
            isActive={editor.isActive('code')}
          >
            <Code size={16} />
          </ToolbarButton>
          
          <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-2">TipTap Editor</span>
        </div>
        
        {/* TEXTAREA CONTENT */}
        <div className="bg-card text-foreground flex-1 overflow-y-auto cursor-text" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
