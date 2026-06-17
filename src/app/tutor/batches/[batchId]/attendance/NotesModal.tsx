import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  initialNotes?: string;
  studentName?: string;
}

export default function NotesModal({
  isOpen,
  onClose,
  onSave,
  initialNotes = "",
  studentName = "the student",
}: NotesModalProps) {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    if (isOpen) {
      setNotes(initialNotes);
    }
  }, [isOpen, initialNotes]);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reason Why {studentName} Was Late</DialogTitle>
          <DialogDescription>
            Add an optional note to specify the reason for being late.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Bus delayed due to heavy rain..."
            className="min-h-[120px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
