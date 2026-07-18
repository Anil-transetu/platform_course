import React, { useEffect, useRef, useState } from "react";
import { CourseNote } from "./types";
import { NotesToolbar } from "./NotesToolbar";
import { Input } from "@/components/ui/input";

interface NotesEditorProps {
  note: CourseNote;
  onChange: (updates: Partial<Pick<CourseNote, "title" | "content">>) => void;
}

export function NotesEditor({ note, onChange }: NotesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(note.title);

  // Sync internal state if active note changes from outside
  useEffect(() => {
    setTitle(note.title);
    if (editorRef.current && editorRef.current.innerHTML !== note.content) {
      editorRef.current.innerHTML = note.content;
    }
  }, [note.id]); // only when the note instance changes

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onChange({ title: e.target.value });
  };

  const handleContentInput = () => {
    if (editorRef.current) {
      onChange({ content: editorRef.current.innerHTML });
    }
  };

  const executeCommand = (command: string) => {
    document.execCommand(command, false, undefined);
    if (editorRef.current) {
      editorRef.current.focus();
      handleContentInput();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full gap-5 animate-in slide-in-from-right-4 duration-500 ease-out">
      <Input
        value={title}
        onChange={handleTitleChange}
        placeholder="Note Title..."
        className="text-3xl font-extrabold tracking-tight border-none shadow-none px-1 h-14 focus-visible:ring-0 rounded-none bg-transparent placeholder:text-muted-foreground/30 transition-all text-foreground"
      />

      <div className="flex flex-col flex-1 border border-border rounded-xl shadow-sm bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all duration-300">
        <NotesToolbar
          onInsertBulletList={() => executeCommand("insertUnorderedList")}
          onInsertNumberedList={() => executeCommand("insertOrderedList")}
        />
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentInput}
          className="flex-1 overflow-y-auto p-5 text-base text-foreground/90 focus:outline-none prose prose-sm prose-p:leading-relaxed prose-headings:font-semibold dark:prose-invert max-w-none"
          data-placeholder="Start typing your notes here..."
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
