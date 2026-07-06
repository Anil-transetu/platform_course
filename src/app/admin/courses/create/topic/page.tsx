"use client";

import { useState, useRef } from "react";
import { FileUp, Video, Globe, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ResourceModals from "@/components/modals/ResourceModals";
import { useCourseStore } from "@/store/useCourseStore";
import CourseSidebar from "@/components/admin/courses/CourseSidebar";
import { RichTextEditor, RichTextEditorRef } from "@/components/ui/RichTextEditor/RichTextEditor";

export default function TopicDetailsPage() {
  const router = useRouter();

  const { course, activeModuleId, activeLessonId, activeTopicId, updateTopic } = useCourseStore();
  
  const activeModule = course.modules.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);
  const activeTopic = activeLesson?.topics.find(t => t.id === activeTopicId);

  const topicTitle = activeTopic?.title || "";
  const topicContent = activeTopic?.content || "";

  const setTopicTitle = (val: string) => {
    if (activeModuleId && activeLessonId && activeTopicId) {
      updateTopic(activeModuleId, activeLessonId, activeTopicId, { title: val });
    }
  };
  
  const setTopicContent = (val: string) => {
    if (activeModuleId && activeLessonId && activeTopicId) {
      updateTopic(activeModuleId, activeLessonId, activeTopicId, { content: val });
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"pdf" | "image" | "video" | "url" | null>(null);

  const editorRef = useRef<RichTextEditorRef>(null);

  const openModal = (type: "pdf" | "image" | "video" | "url") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleAttach = (type: string, payload: { url: string; title?: string }) => {
    if (type === 'image') editorRef.current?.insertImage(payload.url);
    if (type === 'video') editorRef.current?.insertVideo(payload.url);
    if (type === 'pdf') editorRef.current?.insertPdf(payload.url, payload.title || "");
    if (type === 'link') editorRef.current?.insertLink(payload.url, payload.title || "");
  };

  if (!activeTopic) {
    return (
      <div className="bg-slate-100 min-h-screen flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-slate-500 font-medium">No active topic selected.</p>
        <button onClick={() => router.push('/admin/courses/create')} className="text-blue-600 underline font-semibold hover:text-blue-700 transition-colors">Go back to Course</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      <div className="flex p-8 gap-8 items-start min-h-full">
        {/* LEFT SIDEBAR */}
        <CourseSidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* TOPIC DETAILS CARD */}
          <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
            <div className="p-8 border-b border-slate-100/80 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Topic Details</h2>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Topic Title</label>
                <input 
                  type="text"
                  placeholder="Enter topic title..."
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Topic Content</label>
                <RichTextEditor
                  ref={editorRef}
                  value={topicContent}
                  onChange={(html) => setTopicContent(html)}
                  placeholder="Write your topic content here..."
                />
              </div>
            </div>
          </div>

          {/* TOPIC RESOURCES CARD */}
          <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
            <div className="p-8 border-b border-slate-100/80">
              <h2 className="text-lg font-bold text-slate-800">Topic Resources</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        onAttach={handleAttach}
      />
    </div>
  );
}

function ResourceButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 border border-slate-200/80 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-200/60 hover:shadow-[0_8px_30px_rgba(37,99,235,0.04)] transition-all group"
    >
      <div className="text-slate-400 group-hover:text-blue-500 transition-colors mb-3">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-850 uppercase tracking-widest">{label}</span>
    </button>
  );
}
