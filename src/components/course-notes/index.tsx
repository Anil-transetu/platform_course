"use client";

import React, { useState } from "react";
import { NotesFab } from "./NotesFab";
import { NotesDrawer } from "./NotesDrawer";

import { ActiveSidebarItem } from "@/types/student-course";

export interface CourseNotesProps {
  courseId: string;
  activeItem: ActiveSidebarItem | null;
}

export function CourseNotes({ courseId, activeItem }: CourseNotesProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <NotesFab isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <NotesDrawer 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
        courseId={courseId} 
        activeItem={activeItem} 
      />
    </>
  );
}
