"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function CreateDomainModal({ isOpen, onClose, onSubmit }: CreateDomainModalProps) {
  const [domainName, setDomainName] = useState("");
  const [description, setDescription] = useState("");
  const [finalAssignment, setFinalAssignment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleCreate = () => {
    if (!domainName) return;
    onSubmit({
      name: domainName,
      category: description || "New Category",
      finalAssignment,
      tags,
      courses: 0,
      updated: "Just now",
      status: "Active"
    });
    setDomainName("");
    setDescription("");
    setFinalAssignment("");
    setTags([]);
    onClose();
  };

  if (!isOpen) return null;

  const addTag = () => {
    if (input.trim() && !tags.includes(input)) {
      setTags([...tags, input]);
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      
      {/* MODAL */}
      <div className="bg-card w-[500px] rounded-xl shadow-lg p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4 text-slate-800">
          Create New Domain
        </h2>

        {/* FORM */}
        <div className="space-y-4">

          {/* DOMAIN NAME */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Domain Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="e.g Data Science & Engineering"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-colors border-gray-200 text-slate-700"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the educational focus..."
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-colors border-gray-200 text-slate-700 min-h-[80px]"
            />
          </div>

          {/* FINAL ASSIGNMENT */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Final Assignment <span className="text-red-500">*</span>
            </label>
            <Select 
              value={finalAssignment}
              onValueChange={setFinalAssignment}
            >
              <SelectTrigger className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-slate-700 text-sm mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none">
                <SelectValue placeholder="Select a final assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Exam">Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TAG INPUT */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Tags</label>

            <div className="flex gap-2 mt-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a tag"
                className="flex-1 border px-3 py-2.5 text-sm rounded-lg border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />

              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="px-4 border-gray-200 text-gray-700 hover:bg-gray-50 h-10 rounded-lg font-semibold"
              >
                ADD
              </Button>
            </div>

            {/* TAG LIST */}
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-blue-100"
                >
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-800 text-blue-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-4 py-2 border rounded-lg h-10 text-sm font-semibold"
          >
            Cancel
          </Button>

          <Button 
            onClick={handleCreate}
            disabled={!domainName || !finalAssignment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 h-10 text-sm font-semibold hover:bg-blue-700"
          >
            Create Domain
          </Button>
        </div>
      </div>
    </div>
  );
}