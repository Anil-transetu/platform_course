"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Download, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { bulkUploadStudents } from "@/features/admin/students/api/student-api"

export default function BulkUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadStats, setUploadStats] = useState<{success: number, failed: number} | null>(null)

  /* DOWNLOAD TEMPLATE */
  const downloadTemplate = () => {
    const csv = `first_name,last_name,email,mobile_number,password,notes
John,Doe,john.doe@example.com,1234567890,password123,Bulk upload test
Jane,Smith,jane.smith@example.com,0987654321,securepass456,Bulk upload test 2`

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "students_bulk_upload_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  /* OPEN FILE PICKER */
  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  /* HANDLE FILE SELECTION */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload only CSV files.")
      setFile(null)
      setFileName("")
      return
    }

    setFile(selectedFile)
    setFileName(selectedFile.name)
    setError("")
    setUploadSuccess(false)
    setUploadStats(null)
  }

  /* UPLOAD STUDENTS */
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.")
      return
    }

    try {
      setIsUploading(true)
      setError("")
      
      // Read and clean the CSV file before uploading
      const text = await file.text()
      const lines = text.split("\n")
      const cleanedLines = lines
        .map(line => line.split(",").map(cell => cell.trim()).join(","))
        .filter(line => line.length > 0)
      
      const cleanedContent = cleanedLines.join("\n")
      const cleanedFile = new File([cleanedContent], file.name, { type: "text/csv" })

      const result = await bulkUploadStudents(cleanedFile)
      
      if (result.data?.success_count === 0 && result.data?.failed_count === 0) {
        throw new Error("No students were found in the file. Please check your CSV format and ensure headers are correct.")
      }

      // Success - Trigger a refresh before redirecting
      setUploadSuccess(true)
      setUploadStats({
        success: result.data?.success_count || 0,
        failed: result.data?.failed_count || 0
      })
      
      // Clear file after success
      setFile(null)
      setFileName("")
      if (fileInputRef.current) fileInputRef.current.value = ""

      // Redirect after a short delay
      setTimeout(() => {
        router.refresh() // Trigger Next.js data refresh
        router.push("/admin/students")
      }, 2000)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Bulk upload error:", message)
      setError(message || "Failed to upload students. Please check your CSV format.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* BLUR BACKGROUND */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={() => !isUploading && router.push("/admin/students")}
      ></div>

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Upload Students</h2>
            <p className="text-sm text-gray-500 mt-1">Import multiple students at once using a CSV file.</p>
          </div>
          <button
            onClick={() => !isUploading && router.push("/admin/students")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            disabled={isUploading}
          >
            <X size={20}/>
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Template Section */}
          <div className="bg-blue-50/50 rounded-2xl p-6 flex items-start gap-4 border border-blue-100/50">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600">
              <Download size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-blue-900 mb-1">Step 1: Get the template</h3>
              <p className="text-xs text-blue-700/70 mb-4 leading-relaxed">
                Download our standardized CSV template to ensure your data format is correct before uploading.
              </p>
              <button
                onClick={downloadTemplate}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
              >
                Download CSV Template
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 px-1">
              Step 2: Upload your file
            </h3>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />

            <div 
              onClick={openFilePicker}
              className={`
                border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
                ${fileName ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}
              `}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${fileName ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                {fileName ? <FileText size={28} /> : <Upload size={28} />}
              </div>
              
              <div className="text-center">
                {fileName ? (
                  <>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[300px]">{fileName}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">Click to change file</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-gray-900">Choose a CSV file or drag it here</p>
                    <p className="text-xs text-gray-400 mt-1">Maximum file size 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100 animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {uploadSuccess && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex flex-col gap-2 border border-emerald-100 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-sm font-bold">
                <CheckCircle2 size={18} className="shrink-0" />
                Upload Successful!
              </div>
              {uploadStats && (
                <p className="text-xs font-medium ml-7 text-emerald-600/80">
                  Successfully imported {uploadStats.success} students. {uploadStats.failed > 0 && `Failed: ${uploadStats.failed}`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => router.push("/admin/students")}
            disabled={isUploading}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`
              px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2
              ${!file || isUploading ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
            `}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Start Import'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
