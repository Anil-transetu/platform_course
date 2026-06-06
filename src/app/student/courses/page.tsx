"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  MoreVertical,
  PlayCircle,
  Clock,
  Users,
  SearchX,
  ChevronLeft,
  ChevronRight,
  Code,
  Palette,
  Lightbulb,
  Database,
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  {
    id: "CS-204",
    name: "Advanced React Patterns & Performance",
    category: "Programming",
    tech: ["React", "Next.js"],
    instructor: "Dr. Robert King",
    instructorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    progress: 75,
    lastAccessed: "Oct 24, 2024",
    batches: "4/5 Batches",
    color: "blue",
    icon: Code
  },
  {
    id: "DS-101",
    name: "UI/UX Fundamentals: From Wireframe to Prototype",
    category: "Design",
    tech: ["Figma", "UI Kit"],
    instructor: "Sarah Miller",
    instructorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    progress: 30,
    lastAccessed: "Oct 20, 2024",
    batches: "0/3 Batches",
    color: "indigo",
    icon: Palette
  },
  {
    id: "AI-302",
    name: "Soft Skills for Tech Leads & Managers",
    category: "Soft Skills",
    tech: ["Leadership"],
    instructor: "Prof. Alan Chen",
    instructorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alan",
    progress: 100,
    lastAccessed: "Oct 15, 2024",
    batches: "2/2 Batches",
    color: "emerald",
    icon: Lightbulb,
    completed: true
  },
  {
    id: "DB-205",
    name: "Database Systems: PostgreSQL & MongoDB",
    category: "Programming",
    tech: ["PostgreSQL", "MongoDB"],
    instructor: "Linda White",
    instructorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda",
    progress: 60,
    lastAccessed: "Oct 27, 2024",
    batches: "3/4 Batches",
    color: "orange",
    icon: Database
  },
  {
    id: "PY-104",
    name: "Python Scripting: Automation Essentials",
    category: "Programming",
    tech: ["Python", "Automation"],
    instructor: "Thomas Jenkins",
    instructorImg: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    progress: 50,
    lastAccessed: "Oct 28, 2024",
    batches: "1/2 Batches",
    color: "rose",
    icon: Terminal
  }
];

export default function CoursesPage() {
  const [view, setView] = useState<"card" | "table">("card");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enrolled Courses</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your active learning journey and track your progress.</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
          <button 
            onClick={() => setView("card")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
              view === "card" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <LayoutGrid size={14} />
            Card
          </button>
          <button 
            onClick={() => setView("table")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
              view === "table" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:text-gray-900"
            )}
          >
            <List size={14} />
            Table
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search for courses, instructors, or tags..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all font-bold text-sm text-gray-700">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Content View */}
      {filteredCourses.length > 0 ? (
        view === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/student/courses/${course.id}`} className="block group">
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden h-full flex flex-col">
                  {/* Course Header Image/Pattern */}
                  <div className={cn(
                  "h-48 relative overflow-hidden flex items-center justify-center",
                  course.color === "blue" ? "bg-blue-50" :
                  course.color === "indigo" ? "bg-indigo-50" :
                  course.color === "emerald" ? "bg-emerald-50" :
                  course.color === "orange" ? "bg-orange-50" : "bg-rose-50"
                )}>
                  {/* Decorative Abstract Shapes */}
                  <div className={cn(
                    "absolute w-40 h-40 rounded-full blur-3xl opacity-20 animate-pulse",
                    course.color === "blue" ? "bg-blue-500" :
                    course.color === "indigo" ? "bg-indigo-500" :
                    course.color === "emerald" ? "bg-emerald-500" :
                    course.color === "orange" ? "bg-orange-500" : "bg-rose-500"
                  )}></div>
                  <course.icon size={80} className={cn(
                    "relative z-10 transition-transform group-hover:scale-110 duration-500",
                    course.color === "blue" ? "text-blue-500" :
                    course.color === "indigo" ? "text-indigo-500" :
                    course.color === "emerald" ? "text-emerald-500" :
                    course.color === "orange" ? "text-orange-500" : "text-rose-500"
                  )} />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg",
                      course.color === "blue" ? "bg-blue-600 text-white" :
                      course.color === "indigo" ? "bg-indigo-600 text-white" :
                      course.color === "emerald" ? "bg-emerald-600 text-white" :
                      course.color === "orange" ? "bg-orange-600 text-white" : "bg-rose-600 text-white"
                    )}>
                      {course.category}
                    </span>
                    {course.completed && (
                      <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1">
                        <CheckCircle2 size={10} /> Completed
                      </span>
                    )}
                  </div>
                  
                  <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-900 shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <PlayCircle size={20} />
                  </button>
                </div>

                {/* Course Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex gap-2 mb-4">
                    {course.tech.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-tighter rounded-md border border-gray-100">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors">
                    {course.name}
                  </h3>
                  
                  <div className="mt-auto space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            course.color === "blue" ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" :
                            course.color === "indigo" ? "bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]" :
                            course.color === "emerald" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" :
                            course.color === "orange" ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                          )}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-300" />
                        <span>{course.lastAccessed}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-300" />
                        <span>{course.batches}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course ID</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Course Name</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instructor</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Accessed</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCourses.map((course) => (
                    <tr 
                      key={course.id} 
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/student/courses/${course.id}`}
                    >
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200">
                          {course.id}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            course.color === "blue" ? "bg-blue-50 text-blue-600" :
                            course.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                            course.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                            course.color === "orange" ? "bg-orange-50 text-orange-600" : "bg-rose-50 text-rose-600"
                          )}>
                            <course.icon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{course.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{course.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                        <Image 
                          src={course.instructorImg} 
                          alt={course.instructor} 
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" 
                        />
                          <p className="text-sm font-medium text-gray-600">{course.instructor}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 w-48">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                course.color === "blue" ? "bg-blue-600" :
                                course.color === "indigo" ? "bg-indigo-600" :
                                course.color === "emerald" ? "bg-emerald-500" :
                                course.color === "orange" ? "bg-orange-500" : "bg-rose-500"
                              )}
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{course.progress}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-500">{course.lastAccessed}</td>
                      <td className="px-8 py-5 text-right">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination / Info Bar matching design */}
            <div className="px-8 py-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing 1 - {filteredCourses.length} of 24
              </p>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rows per page:</span>
                  <select className="bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft size={16} />
                  </button>
                  {[1, 2, 3].map(p => (
                    <button key={p} className={cn(
                      "w-8 h-8 text-[10px] font-bold rounded-lg transition-all",
                      p === 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:bg-white border border-transparent hover:border-gray-200"
                    )}>
                      {p}
                    </button>
                  ))}
                  <button className="p-2 text-gray-400 hover:text-gray-900 border border-gray-200 rounded-lg">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white p-20 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="p-6 bg-gray-50 rounded-[28px] text-gray-300 mb-6">
            <SearchX size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500 max-w-sm">We couldn&apos;t find any courses matching your search criteria. Try using different keywords.</p>
        </div>
      )}
    </div>
  );
}

function CheckCircle2({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
