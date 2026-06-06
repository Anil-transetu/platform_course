"use client";

import { useState, useCallback } from "react";
import { 
  ChevronRight, 
  FileText, 
  Plus, 
  ChevronDown, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Code,
  FileUp,
  Video,
  Globe,
  Target
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ResourceModals from "@/components/modals/ResourceModals";

export default function TopicDetailsPage() {
  const router = useRouter();
  const [topicTitle, setTopicTitle] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"pdf" | "image" | "video" | "url" | null>(null);

  const openModal = (type: "pdf" | "image" | "video" | "url") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleAddAnotherTopic = useCallback(() => {
    // In a real app, we might save the current topic first
    setTopicTitle("");
    setTopicContent("");
    alert("Topic cleared! You can now add another topic to this lesson.");
  }, []);

  const handleAddAnotherLesson = () => {
    router.push("/admin/courses/create/lesson");
  };

  const handleAddAnotherModule = () => {
    router.push("/admin/courses/create/module");
  };

  const handleAddQuiz = () => {
    router.push("/admin/quizzes/new");
  };

  const handleAddAssignment = () => {
    router.push("/admin/assignments"); // We don't have a /new yet, so sending to list
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* TOP HEADER / BREADCRUMB */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest leading-none">
          <Link href="/admin/courses/create" className="text-gray-400 hover:text-blue-600 transition-colors">Create New Course</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link href="/admin/courses/create/module" className="text-gray-400 hover:text-blue-600 transition-colors">MODULE 1</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link href="/admin/courses/create/lesson" className="text-gray-400 hover:text-blue-600 transition-colors">Foundations of User Experience</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-gray-900">New Topic</span>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/courses/create/lesson">
            <button className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition-all text-xs">
              Back to Lesson
            </button>
          </Link>
          <button className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition-all text-xs">
            Save
          </button>
        </div>
      </div>

      <div className="flex p-8 gap-8">
        {/* LEFT SIDEBAR */}
        <div className="w-80 flex flex-col gap-8">
          {/* TOPIC STRUCTURE */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Topic Structure</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" className="w-3 h-3 rounded border-gray-300 text-blue-600" />
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">MODULE 1: FOUNDATIONS</span>
              </div>
              <div className="flex flex-col ml-4 border-l-2 border-gray-100 pl-4 gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="text-gray-300" size={14} />
                  <span className="text-xs font-bold text-gray-400 truncate tracking-tight">LESSON 1: FOUNDATIONS</span>
                </div>
                <div className="bg-white border-blue-500 border-l-4 rounded-r-xl shadow-sm p-3 flex items-center gap-3">
                  <Target className="text-blue-600" size={16} />
                  <span className="text-sm font-bold text-gray-900 truncate tracking-tight">Topic: {topicTitle || "[New Topic]"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ADD CONTENT TO LESSON */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Add Content to Lesson</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddQuiz}
                className="w-full flex items-center justify-between border border-gray-200 bg-white px-4 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Plus size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Add Quiz</span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              <button 
                onClick={handleAddAssignment}
                className="w-full flex items-center justify-between border border-gray-200 bg-white px-4 py-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Plus size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Add Assignment</span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              <button 
                onClick={handleAddAnotherTopic}
                className="w-full flex items-center justify-center gap-2 border border-blue-100 bg-blue-50/20 text-blue-600 py-3 rounded-xl hover:bg-blue-50 transition-all mt-4 font-bold text-sm"
              >
                <Plus size={16} /> Add Another Topic
              </button>
            </div>
          </div>

          {/* LESSON CONTROLS */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lesson Controls</h3>
            <button 
              onClick={handleAddAnotherLesson}
              className="w-full flex items-center justify-center gap-2 border border-blue-100 bg-white text-blue-600 py-3 rounded-xl hover:bg-blue-50 transition-all font-bold text-sm mb-3"
            >
              <Plus size={16} /> Add Another Lesson
            </button>
            <button 
              onClick={handleAddAnotherModule}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-blue-200 bg-blue-50/10 text-blue-600 py-3 rounded-xl hover:bg-blue-50 transition-all font-bold text-sm"
            >
              <Plus size={16} /> Add Another Module
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-8">
          {/* TOPIC DETAILS CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Topic Details</h2>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Topic Title</label>
                <input 
                  type="text"
                  placeholder="Enter topic title..."
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Topic Content</label>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {/* TOOLBAR */}
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
                    <ToolbarButton icon={<Bold size={16} />} />
                    <ToolbarButton icon={<Italic size={16} />} />
                    <div className="w-[1px] h-6 bg-gray-200 mx-1" />
                    <ToolbarButton icon={<List size={16} />} />
                    <ToolbarButton icon={<ListOrdered size={16} />} />
                    <div className="w-[1px] h-6 bg-gray-200 mx-1" />
                    <ToolbarButton icon={<LinkIcon size={16} />} />
                    <ToolbarButton icon={<ImageIcon size={16} />} />
                    <ToolbarButton icon={<Code size={16} />} />
                    <span className="ml-auto text-[10px] font-bold text-gray-300 uppercase tracking-widest pr-2">Markdown Editor</span>
                  </div>
                  {/* TEXTAREA */}
                  <textarea 
                    placeholder="Write your topic content here..."
                    value={topicContent}
                    onChange={(e) => setTopicContent(e.target.value)}
                    className="w-full h-80 p-8 outline-none resize-none font-normal text-gray-600 placeholder-gray-400 leading-relaxed text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TOPIC RESOURCES CARD */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Topic Resources</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-4 gap-4">
                <ResourceButton icon={<FileUp size={24} />} label="Attach PDF" onClick={() => openModal("pdf")} />
                <ResourceButton icon={<ImageIcon size={24} />} label="Upload Image" onClick={() => openModal("image")} />
                <ResourceButton icon={<Video size={24} />} label="Embed Video" onClick={() => openModal("video")} />
                <ResourceButton icon={<Globe size={24} />} label="Add URL" onClick={() => openModal("url")} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResourceModals 
        isOpen={isModalOpen} 
        type={modalType} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

function ToolbarButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 rounded-md hover:bg-white hover:shadow-sm text-gray-400 hover:text-blue-600 transition-all">
      {icon}
    </button>
  );
}

function ResourceButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 border border-gray-100 rounded-2xl bg-gray-50/10 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
    >
      <div className="text-gray-300 group-hover:text-blue-500 transition-colors mb-3">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-900 uppercase tracking-widest">{label}</span>
    </button>
  );
}
