"use client";

import React from "react";
import { Column } from "@/components/reusable/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquarePlus, MessageSquare } from "lucide-react";

export interface Student {
  studentId: number;
  id?: number | string;
  name: string;
  imageUrl?: string;
  email?: string;
  status?: string; // Optional default from backend
}

export interface AttendanceState {
  status: "Present" | "Absent" | "Late";
  notes?: string;
}

interface ColumnProps {
  attendanceState: Record<number, AttendanceState>;
  onStatusChange: (studentId: number, status: "Present" | "Absent" | "Late") => void;
  onAddNote: (studentId: number, name: string) => void;
}

export function buildAttendanceColumns({
  attendanceState,
  onStatusChange,
  onAddNote,
}: ColumnProps): Column<Student>[] {
  return [
    {
      key: "name",
      label: "STUDENT INFORMATION",
      width: "w-1/3",
      render: (value, row) => {
        // ID mapping depending on what the backend gives us
        const sId = row.studentId || row.id || 0;
        
        // Avatar fallback initials
        const initials = row.name
          ? row.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
          : "ST";

        return (
          <div className="flex items-center gap-3">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
                alt={row.name}
                className="w-10 h-10 rounded-full object-cover bg-slate-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {row.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                ID: ST-{sId}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "ATTENDANCE STATUS",
      width: "w-1/3",
      render: (value, row) => {
        const sId = Number(row.studentId || row.id || 0);
        const currentState = attendanceState[sId]?.status || "Present"; // Default Present? Or "Select"? The mock says buttons, but requirements ask for dropdown.

        return (
          <div className="w-32">
            <Select 
              value={currentState} 
              onValueChange={(val: "Present" | "Absent" | "Late") => onStatusChange(sId, val)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      key: "notes",
      label: "NOTES",
      width: "w-1/3",
      render: (value, row) => {
        const sId = Number(row.studentId || row.id || 0);
        const state = attendanceState[sId];
        const isLate = state?.status === "Late";
        const notes = state?.notes || "";

        if (!isLate) {
          return <span className="text-muted-foreground text-xs italic">N/A</span>;
        }

        const truncateLength = 20;
        const truncatedNotes = notes.length > truncateLength 
          ? notes.substring(0, truncateLength) + "..." 
          : notes;

        return (
          <div className="flex items-center gap-2">
            {notes ? (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="text-sm text-slate-600 cursor-help truncate max-w-[150px]">
                      {truncatedNotes}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{notes}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onAddNote(sId, row.name)}
              title={notes ? "Edit Note" : "Add Note"}
            >
              {notes ? <MessageSquare className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
            </Button>
          </div>
        );
      },
    },
  ];
}
