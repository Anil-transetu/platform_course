"use client";

import { useState } from "react";
import { 
  BarChart3, 
  CheckCircle2, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Moon,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

const summaryStats = [
  {
    label: "Average Attendance %",
    value: "92.4%",
    icon: BarChart3,
    color: "blue"
  },
  {
    label: "Total Days Present",
    value: "158 Days",
    icon: CheckCircle2,
    color: "emerald"
  },
  {
    label: "Recent Streak",
    value: "8 Days",
    icon: Flame,
    color: "orange"
  }
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = ["Mon", "Wed", "Fri"];

// Helper to generate random heatmap data
const generateHeatmap = () => {
  return Array.from({ length: 52 }, () => 
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 4))
  );
};

const heatmapData = generateHeatmap();

const attendanceLogs = [
  { date: "Oct 27, 2023", day: "Friday", course: "Advanced React Patterns", status: "Present" },
  { date: "Oct 26, 2023", day: "Thursday", course: "UI/UX Fundamentals", status: "Late" },
  { date: "Oct 25, 2023", day: "Wednesday", course: "Business Strategy", status: "Absent" },
  { date: "Oct 24, 2023", day: "Tuesday", course: "Data Science 101", status: "Present" },
  { date: "Oct 23, 2023", day: "Monday", course: "Data Structures & Algorithms", status: "Present" },
];

export default function AttendancePage() {


  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance Tracking</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitor your daily presence and consistency.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-100 bg-white">
            <Bell size={20} />
          </button>
          <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-100 bg-white">
            <Moon size={20} />
          </button>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
              stat.color === "blue" ? "bg-blue-600 shadow-blue-500/20" :
              stat.color === "emerald" ? "bg-emerald-500 shadow-emerald-500/20" :
              "bg-orange-500 shadow-orange-500/20"
            )}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap Section */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Attendance History</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-100"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-100/50"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-300"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-700"></div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">More</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-x-auto scrollbar-none">
          <div className="flex gap-1 mb-2 pl-8">
            {months.map(m => (
              <div key={m} className="flex-1 text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center min-w-[32px]">
                {m}
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col justify-between py-1 text-[8px] font-extrabold text-gray-400 uppercase tracking-tighter">
              {days.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="flex flex-1 gap-1">
              {heatmapData.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1 min-w-[12px]">
                  {week.map((day, di) => (
                    <div 
                      key={di} 
                      className={cn(
                        "w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer shadow-sm",
                        day === 0 ? "bg-gray-50 border border-gray-100" :
                        day === 1 ? "bg-emerald-100 border border-emerald-200/20" :
                        day === 2 ? "bg-emerald-300 shadow-[0_0_4px_rgba(110,231,183,0.3)]" :
                        "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Logs Page */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Detailed Logs</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-100 transition-all">
              Status
              <ChevronLeft size={14} className="-rotate-90" />
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-100 transition-all shadow-sm">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/20">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Day</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendanceLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-7">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {log.date}
                    </p>
                  </td>
                  <td className="px-8 py-7">
                    <p className="text-sm font-medium text-gray-500 whitespace-nowrap">{log.day}</p>
                  </td>
                  <td className="px-8 py-7">
                    <p className="text-sm font-medium text-gray-500">{log.course}</p>
                  </td>
                  <td className="px-8 py-7">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center border transition-all",
                      log.status === "Present" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      log.status === "Late" ? "bg-orange-50 text-orange-600 border-orange-100" :
                      "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-8 py-8 flex items-center justify-between bg-gray-50/30">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing 1 - 5 of 24
          </p>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rows per page:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg">
                <span className="text-xs font-bold text-gray-900">5</span>
                <ChevronLeft size={14} className="-rotate-90 text-gray-300" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-300 hover:text-gray-400">
                <ChevronLeft size={20} />
              </button>
              <button className="w-9 h-9 text-[10px] font-bold rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">1</button>
              <button className="w-9 h-9 text-[10px] font-bold rounded-xl text-gray-400 hover:bg-white hover:text-gray-600">2</button>
              <button className="w-9 h-9 text-[10px] font-bold rounded-xl text-gray-400 hover:bg-white hover:text-gray-600">3</button>
              <span className="text-gray-300">...</span>
              <button className="w-9 h-9 text-[10px] font-bold rounded-xl text-gray-400 hover:bg-white hover:text-gray-600">5</button>
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl text-xs hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
              Next
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
