import React from "react";
import { Notebook } from "lucide-react";

export function NotesHeader() {
  return (
    <div className="flex items-center gap-3 pb-5 mb-2 border-b border-border/50">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
        <Notebook className="h-5 w-5 text-primary drop-shadow-sm" />
      </div>
      <div>
        <h2 className="text-lg font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          Personal Notes
        </h2>
        <p className="text-xs text-muted-foreground font-medium">Jot down your learning</p>
      </div>
    </div>
  );
}
