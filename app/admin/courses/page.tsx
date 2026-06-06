"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import CreateDomainModal from "@/components/sidebar/CreateDomainModel";
import StatsCard from "@/components/ui/StatsCard";

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [isDomainOpen, setIsDomainOpen] = useState(false);

  const courses = [
    {
      id: 1,
      name: "Advanced Full-Stack Development",
      category: "Web Development",
      modules: 12,
      updated: "Oct 24, 2023",
      status: "Published",
    },
    {
      id: 2,
      name: "Python for Machine Learning",
      category: "Data Science",
      modules: 8,
      updated: "Oct 20, 2023",
      status: "Draft",
    },
    {
      id: 3,
      name: "Ethical Hacking Fundamentals",
      category: "Cybersecurity",
      modules: 15,
      updated: "Oct 18, 2023",
      status: "Published",
    },
    {
      id: 4,
      name: "UI/UX Strategy & Design",
      category: "Design",
      modules: 6,
      updated: "Oct 15, 2023",
      status: "Published",
    },
  ];

  const [domains, setDomains] = useState([
    {
      id: 1,
      name: "Web Development",
      category: "Technology",
      courses: 12,
      updated: "Oct 24, 2023",
      status: "Active",
    },
    {
      id: 2,
      name: "Data Science",
      category: "Science",
      courses: 8,
      updated: "Oct 20, 2023",
      status: "Active",
    },
    {
      id: 3,
      name: "Cybersecurity",
      category: "Security",
      courses: 15,
      updated: "Oct 18, 2023",
      status: "Active",
    },
    {
      id: 4,
      name: "Design",
      category: "Creative",
      courses: 6,
      updated: "Oct 15, 2023",
      status: "Active",
    },
  ]);

  const handleCreateDomain = (newDomain: Record<string, unknown>) => {
    const nextId = domains.length ? Math.max(...domains.map(d => d.id)) + 1 : 1;
    setDomains([...domains, { 
      id: nextId,
      name: newDomain.name as string,
      category: newDomain.category as string,
      courses: (newDomain.courses as number) || 0,
      updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: (newDomain.status as string) || "Active"
    }]);
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDomains = domains.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-gray-800">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Course Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage and monitor all courses and domains
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsDomainOpen(true)}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-white shadow hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} /> Create New Domain
          </button>

          <Link href="/admin/courses/create">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
              <Plus size={16} /> Create New Course
            </button>
          </Link>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard title="Total Courses" value={24} icon={<BookOpen size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" tooltip="All courses available on the platform" />
        <StatsCard title="Active Courses" value={18} icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" tooltip="Courses currently published and accessible to students" />
        <StatsCard title="Draft Courses" value={6} icon={<FileText size={20} />} iconBgClass="bg-orange-50" iconColorClass="text-orange-600" tooltip="Courses saved as draft and not yet published" />
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl shadow p-4">

        {/* TABS */}
        <div className="flex gap-6 border-b mb-4">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-2 font-medium transition-all ${
              activeTab === "courses"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Courses
          </button>

          <button
            onClick={() => setActiveTab("domains")}
            className={`pb-2 font-medium transition-all ${
              activeTab === "domains"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Domains
          </button>
        </div>

        {/* SEARCH */}
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg w-1/3 outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          <select className="border px-3 py-2 rounded-lg outline-none">
            <option>All Status</option>
            <option>{activeTab === "courses" ? "Published" : "Active"}</option>
            <option>{activeTab === "courses" ? "Draft" : "Inactive"}</option>
          </select>
        </div>

        {/* TABLE */}
        {activeTab === "courses" ? (
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Course Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Total Modules</th>
                <th className="text-left p-3">Last Updated</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{course.id}</td>
                  <td className="p-3 font-medium text-gray-900">{course.name}</td>
                  <td className="p-3 text-gray-600">{course.category}</td>
                  <td className="p-3">{course.modules} Modules</td>
                  <td className="p-3 text-gray-600">{course.updated}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      course.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="p-3 text-blue-600 cursor-pointer hover:underline">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Domain Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Total Courses</th>
                <th className="text-left p-3">Last Updated</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDomains.map((domain) => (
                <tr key={domain.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{domain.id}</td>
                  <td className="p-3 font-medium text-gray-900">{domain.name}</td>
                  <td className="p-3 text-gray-600">{domain.category}</td>
                  <td className="p-3">{domain.courses} Courses</td>
                  <td className="p-3 text-gray-600">{domain.updated}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                      {domain.status}
                    </span>
                  </td>
                  <td className="p-3 text-blue-600 cursor-pointer hover:underline">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Rows per page
            <select className="ml-2 border px-2 py-1 rounded">
              <option>10</option>
              <option>20</option>
            </select>
          </div>

          <div className="flex gap-2 text-sm font-medium">
            <button className="px-3 py-1 border rounded text-gray-500 hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded shadow-sm">1</button>
            <button className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      <CreateDomainModal isOpen={isDomainOpen} onClose={() => setIsDomainOpen(false)} onSubmit={handleCreateDomain} />
    </div>
  );
}