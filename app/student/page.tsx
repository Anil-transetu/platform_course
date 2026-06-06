"use client";

import { 
  BookOpen, 
  Calendar,
  ArrowUpRight,
  CheckSquare
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { cn } from "@/lib/utils";
import StatsCard from "@/components/ui/StatsCard";

const activityData = [
  { day: "MON", value: 40 },
  { day: "TUE", value: 35 },
  { day: "WED", value: 55 },
  { day: "THU", value: 42 },
  { day: "FRI", value: 70 },
  { day: "SAT", value: 48 },
  { day: "SUN", value: 65 },
];

export default function StudentDashboard() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back, Alex! Here&apos;s a summary of your academic progress this semester.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Courses" value={5} icon={<BookOpen size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="Total number of active and completed courses you are enrolled in" />
        <StatsCard title="Completed Assignments" value={12} icon={<CheckSquare size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Total assignments you have submitted this semester" />
        <StatsCard title="Overall Attendance" value="94%" icon={<Calendar size={20} />} iconBgClass="bg-purple-50" iconColorClass="text-purple-600" tooltip="Your attendance percentage across all enrolled courses" />
      </div>

      {/* Activity Chart Section */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Weekly Activity</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500 font-medium">Student Engagement Index</p>
              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
                +5.2%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl">
            <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Daily</button>
            <button className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">Weekly</button>
            <button className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Monthly</button>
          </div>
        </div>

        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderRadius: '12px', 
                  border: 'none',
                  color: '#fff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions / recent? (not in image but adds to premium feel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[32px] text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Continue Learning</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-[250px]">You were last watching &quot;Advanced React Patterns&quot;. Ready to resume?</p>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-500/25 active:scale-95">
              Resume Lesson
              <ArrowUpRight size={18} />
            </button>
          </div>
          <BookOpen className="absolute -bottom-8 -right-8 text-white/5 w-48 h-48 -rotate-12 transition-transform group-hover:rotate-0" />
        </div>
        
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Upcoming Deadline</h3>
              <p className="text-sm text-gray-500 mt-1">Design System Case Study</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 font-bold border border-orange-100">
              2d
            </div>
          </div>
          <div className="mt-8">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
              <span>Progress</span>
              <span>65%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full w-[65%] shadow-[0_0_12px_rgba(249,115,22,0.3)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
