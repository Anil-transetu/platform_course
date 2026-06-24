"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronRight, 
  FileUp,
  Video,
  Globe,
  Image as ImageIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResourceModals from "@/components/modals/ResourceModals";
import { isEmpty, inputErrorClass, errorTextClass } from "@/lib/validation";
import { useCourseStore } from "@/store/useCourseStore";
import CourseSidebar from "@/components/admin/courses/CourseSidebar";
import { RichTextEditor, RichTextEditorRef } from "@/components/ui/RichTextEditor/RichTextEditor";

export default function ModuleDetailsPage() {
  const router = useRouter();
  
  const { course, activeModuleId, updateModule } = useCourseStore();
  const activeModule = course.modules.find(m => m.id === activeModuleId);
  
  // If no active module, we still render but inputs will be disabled or we can handle it
  const moduleTitle = activeModule?.title || "";
  const moduleDescription = activeModule?.description || "";

  const setModuleTitle = (val: string) => {
    if (activeModuleId) updateModule(activeModuleId, { title: val });
  };
  
  const setModuleDescription = (val: string) => {
    if (activeModuleId) updateModule(activeModuleId, { description: val });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"pdf" | "image" | "video" | "url" | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const editorRef = useRef<RichTextEditorRef>(null);

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

  const handleSaveModule = () => {
    const t1 = validateField("moduleTitle", moduleTitle);
    const t2 = validateField("moduleDescription", moduleDescription);
    setTouched({ moduleTitle: true, moduleDescription: true });
    if (t1 || t2) return;
    alert("Module saved successfully!");
  };

  const openModal = (type: "pdf" | "image" | "video" | "url") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleAttach = (type: string, payload: any) => {
    if (type === 'image') editorRef.current?.insertImage(payload.url);
    if (type === 'video') editorRef.current?.insertVideo(payload.url);
    if (type === 'pdf') editorRef.current?.insertPdf(payload.url, payload.title);
    if (type === 'link') editorRef.current?.insertLink(payload.url, payload.title);
  };

  if (!activeModule) {
    return (
      <div className="bg-muted min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500 dark:text-muted-foreground">No active module selected.</p>
        <button onClick={() => router.push('/admin/courses/create')} className="text-blue-600 underline">Go back to Course</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex p-8 gap-8 items-start min-h-full">
        {/* LEFT SIDEBAR */}
        <CourseSidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* MODULE DETAILS CARD */}
          <div className="bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border/50 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-lg font-bold text-foreground">Module Details</h2>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Module Title <span className="text-red-400">*</span></label>
                <input 
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => { 
                    setModuleTitle(e.target.value); 
                    if(errors.moduleTitle){
                      setErrors(prev=>{const n={...prev};delete n.moduleTitle;return n;});
                    } 
                  }}
                  onBlur={() => handleFieldBlur("moduleTitle", moduleTitle)}
                  placeholder="e.g., Introduction to UI Design Fundamentals"
                  className={`w-full px-4 py-3 bg-muted border border-gray-100 dark:border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-card-foreground ${touched.moduleTitle && errors.moduleTitle ? inputErrorClass : ""}`}
                />
                {touched.moduleTitle && errors.moduleTitle && (
                  <p className={errorTextClass}>
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    {errors.moduleTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Module Description <span className="text-red-400">*</span></label>
                <RichTextEditor
                  ref={editorRef}
                  value={moduleDescription}
                  onChange={(html) => {
                    setModuleDescription(html);
                    if(errors.moduleDescription){
                      setErrors(prev=>{const n={...prev};delete n.moduleDescription;return n;});
                    }
                  }}
                  placeholder="Provide a detailed description of what students will learn in this module..."
                />
              </div>
            </div>
          </div>

          {/* MODULE RESOURCES CARD */}
          <div className="bg-card rounded-2xl shadow-sm border border-gray-100 dark:border-border/50 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-lg font-bold text-foreground">Module Resources</h2>
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
      className="flex flex-col items-center justify-center p-8 border border-gray-100 dark:border-border/50 rounded-2xl bg-muted/10 hover:bg-card hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
    >
      <div className="text-gray-400 group-hover:text-blue-500 transition-colors mb-3">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-400 group-hover:text-foreground uppercase tracking-widest">{label}</span>
    </button>
  );
}
