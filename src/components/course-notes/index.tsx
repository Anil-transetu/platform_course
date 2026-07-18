"use client";

import React, { useState } from "react";
import { NotesFab } from "./NotesFab";
import { NotesDrawer } from "./NotesDrawer";

export function CourseNotes() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <NotesFab isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <NotesDrawer isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
