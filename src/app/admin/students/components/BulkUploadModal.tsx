"use client"

import { useState, useRef } from "react"
import { Upload, X, File, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFile = (selectedFile: File) => {
    setError(null)
    
    // Check if it's a CSV file
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError("Only CSV files are allowed.")
      return false
    }
    
    // Check if empty
    if (selectedFile.size === 0) {
      setError("The selected file is empty.")
      return false
    }
    
    // Check max size (10MB limit as per design)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File exceeds the maximum limit of 10MB.")
      return false
    }

    setFile(selectedFile)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFile(e.target.files[0])
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    setIsSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // On success
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 1500)
    } catch (err: unknown) {
      console.error(err)
      setError("An error occurred during upload. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    // Reset state before closing
    setTimeout(() => {
      setFile(null)
      setError(null)
      setIsUploading(false)
      setIsSuccess(false)
    }, 300)
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bulk Upload Students</h2>
            <p className="text-sm text-slate-500 mt-1">Upload student records using a CSV file.</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!file && !isSuccess ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                flex flex-col items-center justify-center min-h-[200px]
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : error 
                    ? 'border-red-300 bg-red-50/30 hover:bg-red-50' 
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                }
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".csv"
                onChange={handleFileChange}
              />
              <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                <Upload size={28} />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">
                Drag and drop your CSV file here
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                or click to browse files
              </p>
              
              <div className="text-xs text-slate-400 flex items-center justify-center gap-4 w-full max-w-[200px] border-t border-slate-100 pt-4">
                <span>Maximum file size: 10MB</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-4">
              <div className={`p-3 rounded-lg flex-shrink-0 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {isSuccess ? <CheckCircle2 size={24} /> : <File size={24} />}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-medium text-slate-900 truncate pr-4">
                  {file?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">
                    {file && formatFileSize(file.size)}
                  </span>
                  {!isSuccess && (
                     <span className="text-xs font-medium text-slate-400">• CSV</span>
                  )}
                </div>
                
                {isUploading && (
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full animate-pulse w-[60%]"></div>
                  </div>
                )}
                
                {isSuccess && (
                  <p className="text-xs font-medium text-green-600 mt-2">
                    Upload completed successfully!
                  </p>
                )}
              </div>
              {!isUploading && !isSuccess && (
                <button 
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* Guidelines */}
          {!file && !error && (
            <div className="mt-6 flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 flex-1">
                Make sure your CSV file has headers matching standard student record format (Name, Email, etc.)
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle size={16} className="flex-shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
            className="border-slate-200 hover:bg-slate-100 text-slate-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || isUploading || isSuccess || !!error}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
          >
            {isUploading ? "Uploading..." : isSuccess ? "Done" : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  )
}
