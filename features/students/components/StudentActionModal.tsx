"use client"

import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { X, AlertCircle, Eye, EyeOff, Trash2 } from "lucide-react"
import { createStudent, updateStudent, deleteStudent, Student } from "@/features/students/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type ModalMode = "create" | "edit" | "delete"

interface StudentActionModalProps {
  isOpen: boolean
  mode: ModalMode
  student?: Student | null
  onClose: () => void
  onSuccess: () => void
}

export default function StudentActionModal({
  isOpen,
  mode,
  student,
  onClose,
  onSuccess
}: StudentActionModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    password: "",
    notes: "",
    is_associated_with_batch: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isOpen) {
      if ((mode === "edit" || mode === "delete") && student) {
        setFormData({
          first_name: student.first_name || "",
          last_name: student.last_name || "",
          email: student.email || "",
          mobile_number: student.mobile_number || "",
          password: "",
          notes: student.notes || "",
          is_associated_with_batch: false
        })
      } else {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          mobile_number: "",
          password: "",
          notes: "",
          is_associated_with_batch: false
        })
      }
      setError(null)
    }
  }, [isOpen, mode, student])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === "create") {
        await createStudent(formData)
      } else if (mode === "edit" && student?.id) {
        await updateStudent(student.id, formData)
      } else if (mode === "delete" && student?.id) {
        await deleteStudent(student.id)
      }

      queryClient.invalidateQueries({ queryKey: ["students"] })
      queryClient.invalidateQueries({ queryKey: ["studentCounts"] })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const isDelete = mode === "delete"
  const title = isDelete ? "Confirm Delete" : mode === "edit" ? "Edit Student" : "Add Student"
  const submitText = isDelete ? "Delete" : mode === "edit" ? "Update Student" : "Add Student"
  const submitVariant = isDelete ? "destructive" : "default"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className={cn(
        "relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300",
        isDelete ? "max-w-md" : "max-w-xl"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          {isDelete ? (
            <div className="space-y-6">
              <p className="text-gray-600">
                Are you sure you want to delete student <span className="font-bold text-gray-900">{student?.first_name} {student?.last_name}</span>?
              </p>
              
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Checkbox 
                  id="batch-check" 
                  checked={formData.is_associated_with_batch}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_associated_with_batch: !!checked }))}
                />
                <label htmlFor="batch-check" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Is the student associated with any batch?
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">First Name</Label>
                  <Input 
                    placeholder="e.g. John" 
                    value={formData.first_name}
                    onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Last Name</Label>
                  <Input 
                    placeholder="e.g. Doe" 
                    value={formData.last_name}
                    onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Email Address</Label>
                <Input 
                  type="email"
                  placeholder="john.doe@example.com" 
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Mobile Number</Label>
                  <Input 
                    placeholder="+1 (555) 000-0000" 
                    value={formData.mobile_number}
                    onChange={e => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                    className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Password</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-500 pr-10"
                      required={mode === "create"}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Notes</Label>
                  <span className="text-[10px] text-gray-400 font-medium">Optional</span>
                </div>
                <Textarea 
                  placeholder="Add any relevant student notes here..." 
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="min-h-[100px] rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-8 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant={submitVariant}
              disabled={isLoading}
              className={cn(
                "h-12 px-8 rounded-xl shadow-lg transition-all",
                !isDelete && "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
              )}
            >
              {isLoading ? "Processing..." : (
                <span className="flex items-center gap-2">
                  {isDelete && <Trash2 size={18} />}
                  {submitText}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
