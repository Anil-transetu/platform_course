"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, MoreVertical, Edit2, Trash2, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CourseNotesSidebarProps {
  courseId: string | number;
}

export interface Note {
  id: string;
  courseId: string | number;
  title?: string;
  content: string;
  type: "general" | "timestamp";
  timestamp?: string; // e.g. "02:45"
  createdAt: number;
}

export default function CourseNotesSidebar({ courseId }: CourseNotesSidebarProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteType, setNoteType] = useState<"general" | "timestamp">("general");
  const [noteTimestamp, setNoteTimestamp] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize and load notes from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("course_notes");
      if (savedNotes) {
        try {
          setNotes(JSON.parse(savedNotes));
        } catch (e) {
          console.error("Failed to parse course notes from localStorage", e);
        }
      }
    }
  }, []);

  // Filter notes by courseId
  const filteredNotes = notes
    .filter((note) => String(note.courseId) === String(courseId))
    .sort((a, b) => b.createdAt - a.createdAt); // Newest notes first

  // Focus input textarea
  const focusInput = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Switch to Add Note mode and focus
  const handleAddNewNoteClick = () => {
    setEditingNoteId(null);
    setNoteContent("");
    setNoteTitle("");
    setNoteType("general");
    setNoteTimestamp("");
    focusInput();
  };

  // Add or Update note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteContent.trim()) return;

    let updatedNotes: Note[];

    if (editingNoteId) {
      // Edit existing note
      updatedNotes = notes.map((note) => {
        if (note.id === editingNoteId) {
          return {
            ...note,
            title: noteTitle.trim() || undefined,
            content: noteContent.trim(),
            type: noteType,
            timestamp: noteType === "timestamp" ? (noteTimestamp.trim() || "00:00") : undefined,
          };
        }
        return note;
      });
      setEditingNoteId(null);
    } else {
      // Add new note
      const newNote: Note = {
        id: crypto.randomUUID(),
        courseId,
        title: noteTitle.trim() || undefined,
        content: noteContent.trim(),
        type: noteType,
        timestamp: noteType === "timestamp" ? (noteTimestamp.trim() || "00:00") : undefined,
        createdAt: Date.now(),
      };
      updatedNotes = [...notes, newNote];
    }

    setNotes(updatedNotes);
    localStorage.setItem("course_notes", JSON.stringify(updatedNotes));

    // Reset form fields
    setNoteContent("");
    setNoteTitle("");
    setNoteType("general");
    setNoteTimestamp("");
  };

  // Start editing a note
  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteContent(note.content);
    setNoteTitle(note.title || "");
    setNoteType(note.type);
    setNoteTimestamp(note.timestamp || "");
    focusInput();
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    localStorage.setItem("course_notes", JSON.stringify(updatedNotes));

    // If we were editing this deleted note, exit edit mode
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setNoteContent("");
      setNoteTitle("");
      setNoteType("general");
      setNoteTimestamp("");
    }
  };

  // Format notes timestamps
  const formatTime = (timeString: string) => {
    // Simple validation/format check (e.g. if the user enters "2:45" or "02:45")
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    return timeString || "00:00";
  };

  return (
    <div className="w-[360px] h-full flex flex-col bg-white border-l border-slate-200 shadow-[2px_0_15px_rgba(0,0,0,0.015)] shrink-0">
      {/* Header Section */}
      <div className="flex justify-between items-center px-5 py-4.5 border-b border-slate-100 shrink-0">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Notes</h2>
        <button
          onClick={handleAddNewNoteClick}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-900 border border-slate-200/60 transition-all hover:scale-105 active:scale-95"
          title="Add Note"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Notes List Section */}
      <div className="flex-grow overflow-y-auto p-5 space-y-4 no-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center px-4">
            <MessageSquare size={36} className="text-slate-250 mb-3" />
            <p className="text-xs font-semibold">No notes for this course yet.</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
              Add general thoughts or specific video timestamp notes below.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "group relative bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all flex flex-col gap-3",
                editingNoteId === note.id && "border-blue-300 ring-2 ring-blue-500/5 bg-blue-50/5"
              )}
            >
              {/* Note Header (Badge and Menu) */}
              <div className="flex justify-between items-center">
                {note.type === "timestamp" ? (
                  <span className="bg-[#ecf3fe] text-[#2563eb] text-[10px] font-bold py-0.5 px-2 rounded-md uppercase tracking-wider">
                    TIMESTAMP {formatTime(note.timestamp || "")}
                  </span>
                ) : (
                  <span className="bg-[#f1f5f9] text-[#475569] text-[10px] font-bold py-0.5 px-2 rounded-md uppercase tracking-wider">
                    GENERAL NOTE
                  </span>
                )}

                {/* Card Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 rounded-md text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors"
                      aria-label="Note actions"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-28 shadow-md border-slate-100">
                    <DropdownMenuItem
                      onClick={() => handleStartEdit(note)}
                      className="cursor-pointer flex items-center gap-2 text-slate-700 text-xs font-semibold"
                    >
                      <Edit2 size={12} className="text-slate-500" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteNote(note.id)}
                      className="cursor-pointer flex items-center gap-2 text-red-650 focus:text-red-700 hover:bg-red-50 focus:bg-red-50 text-xs font-semibold"
                    >
                      <Trash2 size={12} className="text-red-500" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Note Body */}
              <div className="flex flex-col gap-1.5">
                {note.title && (
                  <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                    {note.title}
                  </h4>
                )}
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                  {note.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Section Section */}
      <div className="border-t border-slate-100 p-5 bg-white shrink-0">
        <form onSubmit={handleSaveNote} className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {editingNoteId ? "Edit Note" : "Add Note"}
            </span>

            {/* Note Type Selector Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setNoteType("general")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-slate-550 transition-all",
                  noteType === "general" && "bg-white text-slate-800 shadow-xs"
                )}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setNoteType("timestamp")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-slate-550 transition-all",
                  noteType === "timestamp" && "bg-white text-[#2563eb] shadow-xs"
                )}
              >
                Timestamp
              </button>
            </div>
          </div>

          {/* Title Input (Optional) */}
          <Input
            type="text"
            placeholder="Title (optional)"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            className="text-xs h-9 border-slate-200/80 rounded-xl focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-semibold"
          />

          {/* Timestamp input if Timestamp selected */}
          {noteType === "timestamp" && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">At:</span>
              <Input
                type="text"
                placeholder="MM:SS (e.g. 02:45)"
                value={noteTimestamp}
                onChange={(e) => setNoteTimestamp(e.target.value)}
                className="text-xs h-8 w-32 border-slate-200/80 rounded-lg focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-semibold"
              />
            </div>
          )}

          {/* Content Textarea */}
          <Textarea
            ref={textareaRef}
            placeholder={
              noteType === "timestamp"
                ? "Start typing your note for this timestamp..."
                : "Start typing your note..."
            }
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            required
            className="text-xs min-h-[90px] border-slate-200/80 rounded-xl resize-none focus-visible:ring-blue-500/20 focus-visible:border-blue-500 font-medium"
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            {editingNoteId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddNewNoteClick}
                className="flex-1 text-xs border-slate-200 rounded-xl hover:bg-slate-50 font-bold h-9.5 text-slate-655"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className={cn(
                "flex-1 text-xs font-bold rounded-xl h-9.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all active:scale-95",
                !noteContent.trim() && "opacity-60 cursor-not-allowed hover:bg-blue-600"
              )}
              disabled={!noteContent.trim()}
            >
              {editingNoteId ? "SAVE CHANGES" : "SAVE NOTE"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
