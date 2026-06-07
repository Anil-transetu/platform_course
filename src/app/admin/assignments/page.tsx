"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, 
  FileText, CheckCircle, ClipboardList, Star,
  MoreVertical, FileUp, Link as LinkIcon, Pencil, Trash2
} from "lucide-react";
import StatsCard from "@/components/ui/StatsCard";

import CreateAssignmentModal from "@/components/sidebar/CreateAssignmentModal";

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const router = useRouter();

  const [assignments, setAssignments] = useState([
    {
      id: "ASG-00124",
      title: "Introduction to Web Ethics",
      course: "Web Foundation",
      courseColor: "blue",
      domain: "Web Development",
      tags: ["FRONTEND", "ETHICS"],
      marks: 100,
      submissionType: "FILE UPLOAD",
    },
    {
      id: "ASG-00125",
      title: "Advanced React Hooks Quiz",
      course: "State Management",
      courseColor: "purple",
      domain: "Web Development",
      tags: ["REACT", "FRONTEND"],
      marks: 50,
      submissionType: "LINK",
    },
    {
      id: "ASG-00126",
      title: "Data Modeling Fundamentals",
      course: "Database Systems",
      courseColor: "orange",
      domain: "Data Science",
      tags: ["SQL", "DATABASE"],
      marks: 100,
      submissionType: "FILE UPLOAD",
    },
  ]);

  const handleCreateAssignment = (newAsg: Record<string, unknown>) => {
    const nextNum = assignments.length ? Math.max(...assignments.map(a => parseInt(a.id.split("-")[1] || "0"))) + 1 : 124;
    const newId = `ASG-${nextNum.toString().padStart(5, '0')}`;
    
    setAssignments([...assignments, {
      id: newId,
      title: newAsg.title as string,
      domain: newAsg.domain as string,
      tags: newAsg.tags as string[],
      marks: newAsg.marks as number,
      submissionType: newAsg.submissionType as string,
      course: "New Course",
      courseColor: "blue"
    }]);
  };

  const filteredAssignments = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 font-sans max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Assignment Management
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Create Assignment
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Assignments"
          value="1,240"
          icon={<FileText className="w-5 h-5" />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
          tooltip="Total number of assignments created"
        />
        <StatsCard
          title="Active Assignments"
          value="850"
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgClass="bg-green-50"
          iconColorClass="text-green-600"
          tooltip="Assignments currently active"
        />
        <StatsCard
          title="Submissions Pending"
          value="124"
          icon={<ClipboardList className="w-5 h-5" />}
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-600"
          tooltip="Submitted assignments awaiting grading"
        />
        <StatsCard
          title="Avg. Score"
          value="82%"
          icon={<Star className="w-5 h-5" />}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-600"
          tooltip="Average grade score across all submissions"
        />
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        {/* SEARCH AND FILTER */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by assignment title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <select className="border px-3 py-2 rounded-lg outline-none text-sm font-medium text-card-foreground">
              <option>All</option>
              <option>Active</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-400 text-[11px] font-bold tracking-wider uppercase border-b border-gray-100">
              <tr>
                <th className="text-left pb-4">Assignment Title</th>
                <th className="text-left pb-4">Course</th>
                <th className="text-left pb-4">Domain</th>
                <th className="text-left pb-4">Tags</th>
                <th className="text-left pb-4">Marks</th>
                <th className="text-left pb-4">Submission Type</th>
                <th className="text-center pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((asg) => (
                <tr key={asg.id} className="border-b border-gray-50 hover:bg-muted transition-colors">
                  <td className="py-4 pr-4">
                    <p className="font-bold text-foreground leading-tight">{asg.title}</p>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">ID: {asg.id}</p>
                  </td>
                  <td className="py-4">
                    <CourseBadge label={asg.course} color={asg.courseColor} />
                  </td>
                  <td className="py-4 text-muted-foreground font-medium tracking-wide text-xs">{asg.domain}</td>
                  <td className="py-4">
                    <div className="flex gap-2 flex-wrap">
                      {asg.tags.map(tag => (
                        <span key={tag} className="text-[9px] bg-slate-100 text-muted-foreground font-bold px-2 py-1 rounded-md tracking-widest uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 font-bold text-foreground">{asg.marks}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground tracking-wide bg-slate-100 px-3 py-1.5 rounded-full w-max">
                      {asg.submissionType === "FILE UPLOAD" ? <FileUp size={14} /> : <LinkIcon size={14} />}
                      {asg.submissionType}
                    </div>
                  </td>
                  <td className="py-4 text-center relative">
                    <button 
                      onClick={() => setOpenActionId(openActionId === asg.id ? null : asg.id)}
                      className="text-gray-400 hover:text-muted-foreground transition p-1"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {openActionId === asg.id && (
                      <div className="absolute right-8 top-10 bg-card shadow-xl border border-gray-100 rounded-lg w-32 py-2 z-10 text-left flex flex-col">
                        <button 
                          onClick={() => {
                            setOpenActionId(null);
                            router.push(`/admin/assignments/${asg.id}?mode=edit`);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted transition text-left"
                        >
                          <Pencil size={14} className="text-gray-400" /> Edit
                        </button>
                        <button 
                          onClick={() => {
                            setOpenActionId(null);
                            router.push(`/admin/assignments/${asg.id}?mode=delete`);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition text-left"
                        >
                          <Trash2 size={14} className="text-red-400" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            Rows per page:
            <select className="border px-2 py-1 rounded bg-card outline-none">
              <option>10</option>
              <option>20</option>
            </select>
            <span className="ml-4 text-[13px]">Showing 1-10 of 1,240 assignments</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="px-3 py-1 text-muted-foreground hover:bg-accent rounded text-[13px]">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded font-medium text-[13px]">1</button>
            <button className="px-3 py-1 text-muted-foreground hover:bg-accent rounded font-medium text-[13px]">2</button>
            <span className="px-2 text-gray-400">...</span>
            <button className="px-3 py-1 text-muted-foreground hover:bg-accent rounded font-medium text-[13px]">125</button>
            <button className="px-3 py-1 text-muted-foreground hover:bg-accent rounded text-[13px]">Next</button>
          </div>
        </div>
      </div>

      <CreateAssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateAssignment} 
      />
    </div>
  );
}


function CourseBadge({ label, color }: { label: string; color: string }) {
  const map: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-amber-50 text-amber-600",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${map[color] || "bg-gray-100 text-muted-foreground"}`}>
      {label}
    </span>
  );
}
