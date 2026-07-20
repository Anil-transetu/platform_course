"use client";

import React, { useState, useRef, useEffect } from "react";
import { FileUp, Video, Globe, Image as ImageIcon, BookOpen, Loader2, Trash2, FileText, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import ResourceModals from "@/components/modals/ResourceModals";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";
import { useCourseStore } from "@/store/useCourseStore";
import { RichTextEditor, RichTextEditorRef } from "@/components/ui/RichTextEditor/RichTextEditor";
import { useCreateModule, useCourseModuleDetail } from "@/features/admin/courses/api/course-api";
import { toast } from "sonner";
import { getDisplayMediaUrl, reconstructHtmlFromContentBlocks, parseHtmlToContentBlocks, matchBlocksWithIds } from "@/lib/utils";


const isEmbedUrl = (url: string) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const toastApiError = (err: any, fallbackMessage: string) => {
  if (typeof window !== "undefined" && !navigator.onLine) {
    toast.error("Network disconnected. Please check your connection.");
    return;
  }
  toast.error(err?.message || fallbackMessage);
};

export default function ModuleDetailsPage() {
  const router = useRouter();
  
  const { 
    course, 
    activeModuleId, 
    updateModule,
    addModule,
    deleteModule,
    setActiveModule,
    mapTemporaryModuleId,
    hydrateModuleFromDetail,
  } = useCourseStore();
  
  useEffect(() => {
    if (course.modules.length > 0) {
      const exists = course.modules.some(m => String(m.id) === String(activeModuleId));
      if (!exists) {
        setActiveModule(String(course.modules[0].id));
      }
    }
  }, [course.modules, activeModuleId, setActiveModule]);

  const activeModule = course.modules.find(m => String(m.id) === String(activeModuleId));
  
  const moduleTitle = activeModule?.title || "";
  const moduleDescription = activeModule?.content_blocks && activeModule.content_blocks.length > 0
    ? reconstructHtmlFromContentBlocks(activeModule.content_blocks)
    : activeModule?.description || "";

  const setModuleTitle = (val: string) => {
    if (activeModuleId) updateModule(activeModuleId, { title: val });
  };
  
  const setModuleDescription = (val: string) => {
    if (activeModuleId && activeModule) {
      const parsedBlocks = parseHtmlToContentBlocks(val);
      const matchedBlocks = matchBlocksWithIds(parsedBlocks, activeModule.content_blocks || []);
      updateModule(activeModuleId, { 
        description: val,
        content_blocks: matchedBlocks
      });
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"pdf" | "image" | "video" | "url" | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const editorRef = useRef<RichTextEditorRef>(null);

  const createModuleMutation = useCreateModule();
  const lastSyncedModuleIdRef = useRef<string | null>(null);

  // Lazy loading hook for active module details
  const { data: moduleDetail } = useCourseModuleDetail(
    course.id, 
    activeModuleId ?? undefined, 
    { enabled: !!activeModuleId && !String(activeModuleId).startsWith("temp-") }
  );

  // Sync lazy-loaded module detail back to the Zustand store
  useEffect(() => {
    if (!moduleDetail || !activeModuleId) return;
    const detailId = String(moduleDetail.id ?? activeModuleId);
    if (lastSyncedModuleIdRef.current === detailId) return;

    lastSyncedModuleIdRef.current = detailId;
    hydrateModuleFromDetail(activeModuleId, moduleDetail);

  }, [moduleDetail, activeModuleId, hydrateModuleFromDetail, activeModule?.title]);

  useEffect(() => {
    lastSyncedModuleIdRef.current = null;
  }, [activeModuleId]);

  const handleAddFirstModule = async () => {
    if (!course.id) {
      toast.error("Please save the course details first.");
      return;
    }
    const tempId = addModule();
    try {
      const response = await createModuleMutation.mutateAsync({
        courseId: course.id,
        data: {
          name: "New Module",
          description: "",
          order_num: 1
        }
      });
      const newModule = response.data || response;
      const backendId = String(newModule.id);
      mapTemporaryModuleId(tempId, backendId);
    } catch (err) {
      deleteModule(tempId);
      toastApiError(err, "Failed to create module");
    }
  };

  const validateField = (field: string, value: string): string => {
    let error = "";
    if (field === "moduleTitle" && isEmpty(value)) error = "Module title is required";
    if (field === "moduleDescription" && isEmpty(value)) error = "Module description is required";
    setErrors(prev => {
      if (error) return { ...prev, [field]: error };
      const n = { ...prev }; delete n[field]; return n;
    });
    return error;
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const openModal = (type: "pdf" | "image" | "video" | "url") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleAttach = (type: string, payload: { url: string; title?: string }) => {
    if (editorRef.current) {
      if (type === "image") {
        editorRef.current.insertImage(payload.url);
      } else if (type === "video") {
        editorRef.current.insertVideo(payload.url);
      } else if (type === "pdf") {
        editorRef.current.insertPdf(payload.url, payload.title || "PDF Resource");
      } else if (type === "url" || type === "link") {
        editorRef.current.insertLink(payload.url, payload.title || payload.url);
      }
    }
  };

  const isPendingState = createModuleMutation.isPending;

  if (course.modules.length === 0) {
    return (
      <div className="bg-slate-100 min-h-screen flex-1 flex items-center justify-center flex-col p-6 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-850">Curriculum Builder</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm font-medium">
          Welcome to the course builder! Start designing your learning path by adding the first module.
        </p>
        <button 
          onClick={handleAddFirstModule}
          disabled={createModuleMutation.isPending}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createModuleMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BookOpen size={16} />
          )}
          {createModuleMutation.isPending ? "Adding Module..." : "Add First Module"}
        </button>
      </div>
    );
  }

  if (!activeModule) {
    return (
      <div className="bg-slate-100 min-h-screen flex-1 flex items-center justify-center flex-col gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-semibold text-sm">Loading module details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100">
      <div className="p-8 flex flex-col gap-8 max-w-4xl">
          {/* MODULE DETAILS CARD */}
          <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
            <div className="p-8 border-b border-slate-100/80">
              <h2 className="text-lg font-bold text-slate-800">Module Details</h2>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Module Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  value={moduleTitle}
                  disabled={isPendingState}
                  onChange={(e) => { 
                    setModuleTitle(e.target.value); 
                    if(errors.moduleTitle){
                      setErrors(prev=>{const n={...prev};delete n.moduleTitle;return n;});
                    } 
                  }}
                  onBlur={() => handleFieldBlur("moduleTitle", moduleTitle)}
                  placeholder="e.g., Introduction to UI Design Fundamentals"
                  className={`w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder-slate-450 ${touched.moduleTitle && errors.moduleTitle ? inputErrorClass : ""} ${isPendingState ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                {touched.moduleTitle && errors.moduleTitle && (
                  <p className={errorTextClass}>
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    {errors.moduleTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Module Description <span className="text-rose-500">*</span></label>
                <RichTextEditor
                  key={activeModule.id}
                  ref={editorRef}
                  value={moduleDescription}
                  itemId={activeModule.id}
                  disabled={isPendingState}
                  onChange={(html) => {
                    setModuleDescription(html);
                    if(errors.moduleDescription){
                      setErrors(prev=>{const n={...prev};delete n.moduleDescription;return n;});
                    }
                  }}
                  onBlur={() => handleFieldBlur("moduleDescription", moduleDescription)}
                  placeholder="Provide a detailed description of what students will learn in this module..."
                />
              </div>
            </div>
          </div>





          {/* MODULE RESOURCES CARD */}
          <div className="bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
            <div className="p-8 border-b border-slate-100/80">
              <h2 className="text-lg font-bold text-slate-800">Module Resources</h2>
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
