"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
      <div className="bg-white w-[500px] rounded-xl shadow-lg p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Create New Domain
        </h2>

        {/* FORM */}
        <div className="space-y-4">

          {/* DOMAIN NAME */}
          <div>
            <label className="text-sm text-gray-600">Domain Name</label>
            <input
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="e.g Data Science & Engineering"
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-gray-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the educational focus..."
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* FINAL ASSIGNMENT */}
          <div>
            <label className="text-sm text-gray-600">
              Final Assignment
            </label>
            <select 
              value={finalAssignment}
              onChange={(e) => setFinalAssignment(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option>Select a final assignment</option>
              <option>Project</option>
              <option>Exam</option>
            </select>
          </div>

          {/* TAG INPUT */}
          <div>
            <label className="text-sm text-gray-600">Tags</label>

            <div className="flex gap-2 mt-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a tag"
                className="flex-1 border px-3 py-2 rounded-lg"
              />

              <button
                onClick={addTag}
                className="px-3 bg-gray-200 rounded-lg"
              >
                ADD
              </button>
            </div>

            {/* TAG LIST */}
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button 
            onClick={handleCreate}
            disabled={!domainName}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Create Domain
          </button>
        </div>
      </div>
    </div>
  );
}