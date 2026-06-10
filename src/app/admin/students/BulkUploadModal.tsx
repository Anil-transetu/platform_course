"use client";
import React, { useState, useRef, DragEvent } from "react";
import { useBulkUploadStudents } from "@/hooks/use-students";
import { Modal } from "@/components/ui/modal";
import { Info, Download, Upload, File, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BulkUploadModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useBulkUploadStudents();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "text/csv" || dropped.name.endsWith(".csv"))) {
      setFile(dropped);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: () => {
        onClose();
        setFile(null);
      },
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Bulk Upload Students" size="md">
      <div className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-3 transition-all cursor-pointer
            ${isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-200 bg-gray-50 hover:bg-slate-50/50"}
            ${file ? "border-green-400 bg-green-50/30" : ""}`}
          onClick={() => {
            if (!file) fileInputRef.current?.click();
          }}
        >
          {/* File icon */}
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${file ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-500"}`}>
            {file ? <File className="w-6 h-6" /> : <File className="w-6 h-6 text-blue-500" />}
          </div>
          
          {file ? (
            <div className="flex flex-col items-center gap-1.5 px-6 w-full">
              <p className="text-sm font-semibold text-green-600 truncate max-w-[250px]">{file.name}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 mt-1 border px-2 py-0.5 rounded bg-white shadow-sm transition-colors"
              >
                <X size={12} /> Remove
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-700">Drag and drop CSV file here</p>
              <p className="text-xs text-gray-400 font-medium">Maximum file size: 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-1.5 text-xs font-semibold border rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-all"
              >
                Select File
              </button>
            </>
          )}
        </div>

        {/* Info bar */}
        <div className="flex items-start md:items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg gap-3">
          <div className="flex items-start gap-2 text-xs text-blue-800 font-medium leading-normal">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 md:mt-0" />
            <span>Make sure your file follows the standard template format.</span>
          </div>
          <a
            href="/api/v1/students/template"
            download
            className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Download Template
          </a>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
            className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
