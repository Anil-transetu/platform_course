"use client";

import React, { useState, useRef } from "react";
import { FileUp, Video, Globe, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ResourceModals from "@/components/modals/ResourceModals";
import { useCourseStore } from "@/store/useCourseStore";
import { RichTextEditor, RichTextEditorRef } from "@/components/ui/RichTextEditor/RichTextEditor";
import { useCourseLessonDetail } from "@/features/admin/courses/api/course-api";
import { reconstructHtmlFromContentBlocks, parseHtmlToContentBlocks, matchBlocksWithIds } from "@/lib/utils";



export default function LessonDetailsPage() {
  const router = useRouter();
  
  const { 
    course, 
    activeModuleId, 
    activeLessonId, 
    updateLesson,
    setActiveLesson,
    hydrateLessonFromDetail,
  } = useCourseStore();
  
  useEffect(() => {
    const activeModule = course.modules.find(m => String(m.id) === String(activeModuleId));
    if (activeModule && activeModule.lessons.length > 0) {
      const exists = activeModule.lessons.some(l => String(l.id) === String(activeLessonId));
      if (!exists) {
        setActiveLesson(String(activeModule.lessons[0].id));
      }
    }
  }, [course.modules, activeModuleId, activeLessonId, setActiveLesson]);
  
  const activeModule = course.modules.find(m => String(m.id) === String(activeModuleId));
  const activeLesson = activeModule?.lessons.find(l => String(l.id) === String(activeLessonId));

  const lessonTitle = activeLesson?.title || "";
  const lessonContent = activeLesson?.content_blocks && activeLesson.content_blocks.length > 0
    ? reconstructHtmlFromContentBlocks(activeLesson.content_blocks)
    : activeLesson?.content || "";

  // Lazy loading hook for active lesson details
  const { data: lessonDetail } = useCourseLessonDetail(
    course.id, 
    activeLessonId ?? undefined, 
    { enabled: !!activeLessonId && !String(activeLessonId).startsWith("temp-") }
  );

  // Sync lazy-loaded lesson detail back to the store
  const lastSyncedLessonIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lessonDetail || !activeLessonId || !activeModuleId) return;
    const detailId = String(lessonDetail.id ?? activeLessonId);
    if (lastSyncedLessonIdRef.current === detailId) return;

    lastSyncedLessonIdRef.current = detailId;
    hydrateLessonFromDetail(activeModuleId, activeLessonId, lessonDetail);
  }, [lessonDetail, activeLessonId, activeModuleId, hydrateLessonFromDetail]);

  useEffect(() => {
    lastSyncedLessonIdRef.current = null;
  }, [activeLessonId]);

  const setLessonTitle = (val: string) => {
    if (activeModuleId && activeLessonId) {
      updateLesson(activeModuleId, activeLessonId, { title: val });
    }
  };
  
  const setLessonContent = (val: string) => {
    if (activeModuleId && activeLessonId && activeLesson) {
      const parsedBlocks = parseHtmlToContentBlocks(val);
      const matchedBlocks = matchBlocksWithIds(parsedBlocks, activeLesson.content_blocks || []);
      updateLesson(activeModuleId, activeLessonId, { 
        content: val,
        content_blocks: matchedBlocks
      });
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

  if (!activeLesson) {
    return (
      <div className="bg-slate-100 min-h-screen flex-1 flex items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading lesson details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      <div className="p-8 flex flex-col gap-8 max-w-4xl">
          {/* LESSON DETAILS CARD */}
          <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
            <div className="p-8 border-b border-slate-100/80">
              <h2 className="text-lg font-bold text-slate-800">Lesson Details</h2>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lesson Title</label>
                <input 
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Foundations of User Experience"
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-450"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lesson Content</label>
                <RichTextEditor
                  key={activeLesson.id}
                  ref={editorRef}
                  value={lessonContent}
                  itemId={activeLesson.id}
                  onChange={(html) => setLessonContent(html)}
                  placeholder="Write your lesson content here..."
                />
              </div>
            </div>
          </div>


          {/* LESSON RESOURCES CARD */}
          <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
            <div className="p-8 border-b border-slate-100/80">
              <h2 className="text-lg font-bold text-slate-800">Lesson Resources</h2>
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
