import React from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotesHeader } from "./NotesHeader";
import { NotesEditor } from "./NotesEditor";
import { useCourseNotes } from "./hooks/useCourseNotes";

interface NotesDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotesDrawer({ isOpen, onOpenChange }: NotesDrawerProps) {
  const isMobile = useIsMobile();
  const { note, updateNote } = useCourseNotes();

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
          side={isMobile ? "bottom" : "right"}
          className={`${
            isMobile ? "h-[85vh] rounded-t-xl" : "w-[400px] sm:w-[420px]"
          } p-0 flex flex-col bg-background shadow-2xl border-l`}
        >
          <SheetTitle className="sr-only">Course Notes</SheetTitle>
          <SheetDescription className="sr-only">
            Personal notes area for this course
          </SheetDescription>
          <div className="flex flex-col h-full overflow-hidden p-6">
            <NotesHeader />
            <div className="flex-1 mt-4 flex flex-col overflow-hidden">
              {note && (
                <NotesEditor
                  note={note}
                  onChange={updateNote}
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
