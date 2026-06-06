"use client";

import { useState } from "react";
import { 
  FileText, 
  CheckCircle2, 
  PieChart, 
  Info, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Code2,
  Terminal,
  Palette,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const summaryStats = [
  {
    label: "Total Assignments",
    value: "24",
    icon: FileText,
    color: "blue",
    info: "Total number of assignments assigned to you."
  },
  {
    label: "Completed Assignments",
    value: "18",
    icon: CheckCircle2,
    color: "emerald",
    info: "Number of assignments you have successfully submitted."
  },
  {
    label: "Completion Percentage",
    value: "75%",
    icon: PieChart,
    color: "orange",
    info: "You have successfully submitted out of the total assigned."
  }
];

const assignments = [
  {
    id: "#AS-001",
    name: "Advanced React Hooks Project",
    course: "Advanced React Patterns",
    dueDate: "Oct 28, 2023",
    dueStatus: "2 days left",
    status: "Pending",
    icon: Code2,
    color: "blue"
  },
  {
    id: "#AS-002",
    name: "Wireframing Case Study",
    course: "UI/UX Fundamentals",
    dueDate: "Oct 24, 2023",
    dueStatus: "Submitted",
    status: "Submitted",
    icon: Palette,
    color: "indigo"
  },
  {
    id: "#AS-003",
    name: "SWOT Analysis Report",
    course: "Business Strategy",
    dueDate: "Oct 15, 2023",
    dueStatus: "Graded",
    status: "Graded",
    icon: Briefcase,
    color: "purple"
  },
  {
    id: "#AS-004",
    name: "Python Data Visualization",
    course: "Data Science 101",
    dueDate: "Nov 02, 2023",
    dueStatus: "Incoming",
    status: "Pending",
    icon: Terminal,
    color: "rose"
  },
  {
    id: "#AS-005",
    name: "Marketing Plan Proposal",
    course: "Business Strategy",
    dueDate: "Oct 12, 2023",
    dueStatus: "Graded",
    status: "Graded",
    icon: Briefcase,
    color: "orange"
  }
];

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssignments = assignments.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Assignments</h1>
        <p className="text-gray-500 mt-1 font-medium">Track and manage your academic progress.</p>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-6 relative overflow-hidden group">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
              stat.color === "blue" ? "bg-blue-600 shadow-blue-500/20" :
              stat.color === "emerald" ? "bg-emerald-500 shadow-emerald-500/20" :
              "bg-orange-500 shadow-orange-500/20"
            )}>
              <stat.icon size={28} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 group/info">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                <div className="relative">
                  <Info size={14} className="text-gray-300 cursor-help hover:text-gray-500 transition-colors" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#0F172A] text-white text-[10px] font-medium rounded-xl opacity-0 scale-95 group-hover/info:opacity-100 group-hover/info:scale-100 transition-all pointer-events-none z-50 shadow-xl border border-white/10">
                    <p className="leading-relaxed">{stat.info}</p>
                    {/* Tooltip Point */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-[#0F172A]"></div>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
            </div>
            {/* Background Pattern */}
            <div className={cn(
              "absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-5",
              stat.color === "blue" ? "bg-blue-600" :
              stat.color === "emerald" ? "bg-emerald-500" :
              "bg-orange-600"
            )}></div>
          </div>
        ))}
      </div>

      {/* Assignment Table & Toolbar */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search for assignments, courses, or keywords..." 
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-400">
              <span className="text-gray-300">⌘</span> K
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all font-bold text-sm text-gray-700 w-full md:w-auto">
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignment Name</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-400">{assignment.id}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                        assignment.color === "blue" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        assignment.color === "indigo" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                        assignment.color === "purple" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                        assignment.color === "rose" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                        "bg-orange-50 text-orange-600 border border-orange-100"
                      )}>
                        <assignment.icon size={20} />
                      </div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {assignment.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-500 whitespace-nowrap">
                    {assignment.course}
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{assignment.dueDate}</p>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        assignment.status === "Pending" ? "text-rose-500" : "text-gray-400"
                      )}>
                        {assignment.dueStatus}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border transition-all",
                      assignment.status === "Pending" ? "bg-orange-50 text-orange-600 border-orange-100" :
                      assignment.status === "Submitted" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        assignment.status === "Pending" ? "bg-orange-500" :
                        assignment.status === "Submitted" ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination matches reference precisely */}
        <div className="px-8 py-8 flex items-center justify-between bg-gray-50/30">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing 1 - {filteredAssignments.length} of 24
          </p>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rows per page:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                <span className="text-xs font-bold text-gray-900">5</span>
                <ChevronLeft size={14} className="text-gray-400 -rotate-90" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-300 hover:text-gray-400 disabled:opacity-30">
                <ChevronLeft size={20} />
              </button>
              {[1, 2, 3, 4, 5].map(p => (
                <button key={p} className={cn(
                  "w-9 h-9 text-[10px] font-bold rounded-xl transition-all",
                  p === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:bg-white hover:text-gray-600"
                )}>
                  {p}
                </button>
              ))}
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
