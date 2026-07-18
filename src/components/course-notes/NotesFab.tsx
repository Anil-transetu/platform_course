import React from "react";
import { Notebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotesFabProps {
  onClick: () => void;
  isOpen: boolean;
}

export function NotesFab({ onClick, isOpen }: NotesFabProps) {
  // If drawer is open, we can hide the FAB or keep it active. 
  // Let's keep it but with an active state if needed, or just let it float.
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            onClick={onClick}
            className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.05] hover:shadow-primary/30 active:scale-95 border border-primary/20 ${
              isOpen 
                ? "bg-gradient-to-tr from-primary to-primary/80 ring-2 ring-primary/20 ring-offset-2 ring-offset-background" 
                : "bg-gradient-to-br from-primary/90 to-primary"
            }`}
          >
            <Notebook className="h-6 w-6 text-primary-foreground drop-shadow-sm" />
            <span className="sr-only">Course Notes</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>Course Notes</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
