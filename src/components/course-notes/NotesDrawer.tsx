import React from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotesHeader } from "./NotesHeader";
import { NotesEditor } from "./NotesEditor";
import { useCourseNotes } from "./hooks/useCourseNotes";
import { ActiveSidebarItem } from "@/types/student-course";
import { Loader2 } from "lucide-react";

interface NotesDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  activeItem: ActiveSidebarItem | null;
}

export function NotesDrawer({ isOpen, onOpenChange, courseId, activeItem }: NotesDrawerProps) {
  const isMobile = useIsMobile();
  const { note, updateNote, saveNote, isSaving, isLoading, isError } = useCourseNotes(courseId, activeItem, isOpen);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          display: block;
        }
      `}} />
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] md:w-[420px] p-0 flex flex-col bg-background shadow-2xl border-l h-full"
        >
          <SheetTitle className="sr-only">Course Notes</SheetTitle>
          <SheetDescription className="sr-only">
            Personal notes area for this course
          </SheetDescription>
          <div className="flex flex-col h-full overflow-hidden p-6">
            <NotesHeader />
            <div className="flex-1 mt-4 flex flex-col overflow-hidden">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                  <p className="text-sm">Loading your notes...</p>
                </div>
              ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center text-destructive gap-3 text-center">
                  <p className="text-sm font-medium">Failed to load notes</p>
                  <p className="text-xs text-muted-foreground">Please try again later</p>
                </div>
              ) : note ? (
                <NotesEditor
                  note={note}
                  onChange={updateNote}
                  onSave={saveNote}
                  isSaving={isSaving}
                />
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
