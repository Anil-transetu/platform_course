import React from "react";
import { List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NotesToolbarProps {
  onInsertBulletList: () => void;
  onInsertNumberedList: () => void;
}

export function NotesToolbar({
  onInsertBulletList,
  onInsertNumberedList,
}: NotesToolbarProps) {
  return (
    <div className="flex items-center gap-1.5 p-2.5 bg-muted/30 border-b border-border/50">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-border/60 rounded-md bg-background/40"
        onClick={onInsertBulletList}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-background shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-border/60 rounded-md bg-background/40"
        onClick={onInsertNumberedList}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}
