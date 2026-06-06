"use client";

import { X, FileUp, Image as ImageIcon, Video, Link as LinkIcon, UploadCloud, MonitorPlay } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type ModalType = "pdf" | "image" | "video" | "url" | null;

interface ResourceModalsProps {
  isOpen: boolean;
  type: ModalType;
  onClose: () => void;
}

export default function ResourceModals({ isOpen, type, onClose }: ResourceModalsProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case "pdf":
        return <PdfModalContent onClose={onClose} />;
      case "image":
        return <ImageModalContent onClose={onClose} />;
      case "video":
        return <VideoModalContent onClose={onClose} />;
      case "url":
        return <UrlModalContent onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 invisible"}`}>
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* MODAL CONTAINER */}
      <div className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
        {getModalContent()}
      </div>
    </div>
  );
}

/* PDF MODAL */
function PdfModalContent({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name);
    }
  };

  const handleAttach = () => {
    if (!file) {
      alert("Please select a PDF file first.");
      return;
    }
    console.log("Attaching PDF:", { title, file });
    alert(`PDF "${title}" attached successfully!`);
    onClose();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shadow-sm">
            <FileUp className="text-red-500" size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Attach PDF Resource</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Resource Title</label>
          <input 
            type="text"
            placeholder="e.g. Design Principles Guide.pdf"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Upload File</label>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-blue-50/20 hover:border-blue-200 transition-all group cursor-pointer relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className={file ? "text-green-500" : "text-blue-500"} size={28} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
              {file ? file.name : "Click to upload or drag and drop"}
            </p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Maximum file size: 50MB</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-10">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">Cancel</button>
        <button 
          onClick={handleAttach}
          className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
        >
          <LinkIcon size={16} strokeWidth={2.5} /> Attach PDF
        </button>
      </div>
    </div>
  );
}

/* IMAGE MODAL */
function ImageModalContent({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name);
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select an image first.");
      return;
    }
    console.log("Uploading Image:", { title, file });
    alert(`Image "${title}" uploaded successfully!`);
    onClose();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Upload Image</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Image Title</label>
          <input 
            type="text"
            placeholder="Enter image name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800"
          />
        </div>

        <div>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-blue-50/20 hover:border-blue-200 transition-all group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50/50 flex items-center justify-center mb-6">
              <ImageIcon className={file ? "text-green-600" : "text-blue-600"} size={28} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
              {file ? file.name : "Drag & drop your image here"}
            </p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Supports PNG, JPG or WEBP (Max 5MB)</p>
            <button className="mt-8 px-6 py-2.5 border border-blue-600/20 text-blue-600 bg-white rounded-xl font-bold text-xs hover:bg-blue-50 hover:border-blue-600/40 transition-all shadow-sm">
              Choose Image
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-10">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">Cancel</button>
        <button 
          onClick={handleUpload}
          className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
        >
          Upload
        </button>
      </div>
    </div>
  );
}

/* VIDEO MODAL */
function VideoModalContent({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) setTitle(e.target.files[0].name);
    }
  };

  const handleAttach = () => {
    if (!url && !file) {
      alert("Please enter a video URL or select a video file first.");
      return;
    }
    console.log("Attaching Video:", { title, url, file });
    alert(`Video "${title}" attached successfully!`);
    onClose();
  };

  return (
    <div className="p-8 text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm">
            <MonitorPlay className="text-blue-600" size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Attach Video Resource</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Video Title</label>
          <input 
            type="text"
            placeholder="Enter a title for this video..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Upload Video File</label>
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-blue-50/20 hover:border-blue-200 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <Video className={file ? "text-green-500" : "text-blue-500"} size={24} strokeWidth={1.5} />
            </div>
            <p className="text-xs font-bold text-gray-800 group-hover:text-blue-700 transition-colors text-center">
              {file ? file.name : "Click to select video from computer"}
            </p>
          </div>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-white px-4 text-gray-300">OR</span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Video URL</label>
          <div className="relative group">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" size={16} />
            <input 
              type="text"
              placeholder="Paste YouTube or Vimeo link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-10">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">Cancel</button>
        <button 
          onClick={handleAttach}
          className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
        >
          Attach Video
        </button>
      </div>
    </div>
  );
}

/* URL MODAL */
function UrlModalContent({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleAddLink = () => {
    if (!url) {
      alert("Please enter a URL first.");
      return;
    }
    console.log("Adding Link:", { title, url });
    alert(`Link "${title}" added successfully!`);
    onClose();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Add URL</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Link Title</label>
          <input 
            type="text"
            placeholder="e.g., External Documentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">URL</label>
          <div className="relative group">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" size={16} />
            <input 
              type="text"
              placeholder="https://example.com/resource"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-10">
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">Cancel</button>
        <button 
          onClick={handleAddLink}
          className="px-10 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
        >
          Add Link
        </button>
      </div>
    </div>
  );
}
