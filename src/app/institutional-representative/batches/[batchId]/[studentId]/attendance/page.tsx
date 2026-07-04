"use client";

import React, { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ListingScreenTemplate from "@/components/reusable/ListingScreenTemplate";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRepAttendanceCalendar, CalendarDay } from "@/features/institutional-representative/api/batches-api";
import { useStudentProfile } from "@/features/institutional-representative/hooks/use-student-profiles";

interface AttendanceCalendarPageProps {
  params: Promise<{ batchId: string; studentId: string }>;
}

const weekdayToIndex = (day?: string) => {
  switch (day?.toUpperCase()) {
    case "SUN": return 0;
    case "MON": return 1;
    case "TUE": return 2;
    case "WED": return 3;
    case "THU": return 4;
    case "FRI": return 5;
    case "SAT": return 6;
    default: return 0;
  }
};

const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  if (s === "present") {
    return {
      dotClass: "bg-emerald-500",
      label: "PRESENT",
      cellBg: "bg-white",
      borderClass: "border-slate-100"
    };
  } else if (s === "absent") {
    return {
      dotClass: "bg-rose-500",
      label: "ABSENT",
      cellBg: "bg-rose-50/10",
      borderClass: "border-slate-100"
    };
  } else if (s === "late") {
    return {
      dotClass: "bg-amber-500",
      label: "LATE",
      cellBg: "bg-amber-50/10",
      borderClass: "border-slate-100"
    };
  } else if (s === "no_class" || s === "no class") {
    return {
      dotClass: "bg-slate-300",
      label: "NO CLASS",
      cellBg: "bg-slate-50/30",
      borderClass: "border-slate-100"
    };
  } else {
    return {
      dotClass: "bg-slate-300",
      label: status.toUpperCase().replace("_", " "),
      cellBg: "bg-slate-50/30",
      borderClass: "border-slate-100"
    };
  }
};

export default function AttendanceCalendarPage({ params }: AttendanceCalendarPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const batchId = decodeURIComponent(resolvedParams.batchId);
  const studentId = decodeURIComponent(resolvedParams.studentId);

  // Initialize with the actual current year and month dynamically
  const [currentMonthStr, setCurrentMonthStr] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  // Fetch Attendance Calendar from backend
  const { data, isLoading, error } = useRepAttendanceCalendar(batchId, studentId, currentMonthStr);

  const { data: freshProfile } = useStudentProfile(studentId);

  const studentName = useMemo(() => {
    if (freshProfile) {
      return `${freshProfile.first_name || ""} ${freshProfile.last_name || ""}`.trim();
    }
    return data?.student_name || "Student Profile";
  }, [data?.student_name, freshProfile]);

  const displayStudentId = data?.student_id || `#${studentId}`;
  const batchName = data?.batch_name || `Batch #${batchId}`;
  const calendarDays = data?.calendar_days || [];
  const monthlyStats = data?.monthly_stats;

  // Formatting Month Year for heading (e.g., "2026-06" -> "JUNE 2026")
  const formattedMonthYear = useMemo(() => {
    try {
      const [year, month] = currentMonthStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
    } catch (e) {
      return currentMonthStr;
    }
  }, [currentMonthStr]);

  const handlePrevMonth = () => {
    const [year, month] = currentMonthStr.split("-").map(Number);
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setCurrentMonthStr(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthStr.split("-").map(Number);
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setCurrentMonthStr(`${newYear}-${String(newMonth).padStart(2, "0")}`);
  };

  // Alignment empty cells
  const emptyCells = useMemo(() => {
    if (calendarDays.length === 0) return [];
    const firstDay = calendarDays[0];
    const count = weekdayToIndex(firstDay.day_of_week);
    return Array.from({ length: count });
  }, [calendarDays]);

  const extraHeaderActions = (
    <button
      onClick={() => router.push(`/institutional-representative/batches/${batchId}/${studentId}`)}
      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 bg-white transition-all text-gray-700 shadow-sm"
    >
      <ArrowLeft size={16} />
      Back to Profile
    </button>
  );

  if (isLoading) {
    return (
      <ListingScreenTemplate
        headerText="Attendance Calendar"
        extraActions={extraHeaderActions}
      >
        <div className="flex flex-col gap-6 p-6 h-full flex-1 overflow-auto bg-slate-50/50">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Calendar Skeleton */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card className="border border-slate-100 shadow-sm bg-white">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="h-8 w-48" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <div className="grid grid-cols-7 gap-2 min-h-[300px]">
                    {[...Array(28)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Stats Panel Skeleton */}
            <div>
              <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-5 w-40 mb-4" />
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                      <Skeleton className="w-10 h-10 rounded-xl" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ListingScreenTemplate>
    );
  }

  return (
    <ListingScreenTemplate
      headerText="Attendance Calendar"
      extraActions={extraHeaderActions}
    >
      <div className="flex flex-col gap-6 p-6 h-full flex-1 overflow-auto bg-slate-50/50">
        
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
          {freshProfile?.profile_image ? (
            <img
              src={freshProfile.profile_image}
              alt={studentName}
              className="w-14 h-14 rounded-full object-cover shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full font-bold text-lg flex items-center justify-center shrink-0 shadow-sm bg-blue-100 text-blue-600">
              {studentName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{studentName}</h2>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <span>Student ID: <span className="font-semibold text-slate-700">{displayStudentId}</span></span>
              <span>•</span>
              <span className="font-medium text-slate-600">{batchName}</span>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Block - Attendance Grid */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="border border-slate-100 shadow-sm">
              <CardContent className="p-6">
                
                {/* Calendar Navigator */}
                <div className="flex justify-center items-center gap-16 mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-bold text-slate-800 tracking-widest min-w-[200px] text-center select-none">
                    {formattedMonthYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Weekdays Labels */}
                <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-t-xl overflow-hidden mb-px">
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                    <div key={day} className="bg-white py-3 text-center text-xs font-bold text-slate-400 border-b border-slate-100">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                {isLoading ? (
                  <div className="h-[360px] flex items-center justify-center border border-slate-100 rounded-b-xl bg-white">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="text-xs text-muted-foreground">Loading attendance...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="h-[360px] flex items-center justify-center border border-slate-100 rounded-b-xl bg-white text-rose-500 font-medium">
                    Error loading attendance: {error.message}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-b-xl overflow-hidden min-h-[360px]">
                    {/* Empty alignment padding cells */}
                    {emptyCells.map((_, idx) => (
                      <div key={`empty-${idx}`} className="bg-white min-h-[70px] sm:min-h-[90px] border-b border-r border-slate-100 last:border-r-0" />
                    ))}

                    {/* Active Month Days */}
                    {calendarDays.map((day) => {
                      const dayNumber = day.date.split("-")[2];
                      const { dotClass, label, cellBg } = getStatusConfig(day.status);
                      const isNoClass = day.status === "no_class" || day.status === "no_session";

                      return (
                        <div
                          key={day.date}
                          className={cn(
                            "flex flex-col justify-between p-3.5 min-h-[75px] sm:min-h-[95px] transition-all hover:bg-slate-50/40 bg-white border-b border-r border-slate-100 last:border-r-0",
                            cellBg
                          )}
                        >
                          <span className={cn(
                            "text-xs sm:text-sm font-bold self-start",
                            isNoClass ? "text-slate-300" : "text-slate-500"
                          )}>
                            {dayNumber}
                          </span>
                          <div className="flex items-center gap-1.5 mt-2 self-start">
                            <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotClass)} />
                            <span className={cn(
                              "text-[9px] font-bold tracking-wider",
                              isNoClass ? "text-slate-400" : "text-slate-600"
                            )}>
                              {label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Legend bar */}
                <div className="flex flex-wrap items-center justify-center gap-8 mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>PRESENT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>ABSENT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>LATE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span>NO CLASS</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Block - Stats Panel */}
          <div>
            <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <h3 className="text-sm font-extrabold text-slate-700 tracking-wider mb-5 uppercase">
                  Monthly Statistics
                </h3>

                {isLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    
                    {/* Total Working Days */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-blue-100/60 bg-blue-50/20">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                          Total Working Days
                        </span>
                        <span className="text-2xl font-black text-slate-800 mt-1 block">
                          {monthlyStats?.total_working_days || 0}
                        </span>
                      </div>
                      <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Days Present */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-emerald-100/60 bg-emerald-50/20">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          Days Present
                        </span>
                        <span className="text-2xl font-black text-emerald-600 mt-1 block">
                          {monthlyStats?.days_present || 0}
                        </span>
                      </div>
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Absences */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-rose-100/60 bg-rose-50/20">
                      <div>
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                          Absences
                        </span>
                        <span className="text-2xl font-black text-rose-600 mt-1 block">
                          {String(monthlyStats?.absences || 0).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                        <XCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Late Occurrences */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-amber-100/60 bg-amber-50/20">
                      <div>
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                          Late Occurrences
                        </span>
                        <span className="text-2xl font-black text-amber-600 mt-1 block">
                          {String(monthlyStats?.late_occurrences || 0).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                        <Clock className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Attendance Rate</span>
                        <span className="text-blue-600 text-sm font-black">
                          {monthlyStats?.attendance_rate_percent || 0}%
                        </span>
                      </div>
                      <Progress
                        value={monthlyStats?.attendance_rate_percent || 0}
                        className="h-2.5 bg-slate-100"
                        indicatorClassName="bg-blue-600"
                      />
                    </div>

                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </ListingScreenTemplate>
  );
}
