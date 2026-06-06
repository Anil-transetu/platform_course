"use client";

import { useState } from "react";
import { X, Info, LayoutGrid, Plus, Bold, Italic, List, Link as LinkIcon, Code } from "lucide-react";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

export default function CreateAssignmentModal({ isOpen, onClose, onSubmit }: CreateAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [tags, setTags] = useState("");
  const [criteria, setCriteria] = useState([
    { name: "Code Quality and Best Practices", marks: "0" },
    { name: "Documentation and Readability", marks: "0" }
  ]);

  if (!isOpen) return null;

  const handleAddCriteria = () => {
    setCriteria([...criteria, { name: "", marks: "0" }]);
  };

  const handleUpdateCriteria = (index: number, field: string, value: string) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const handleCreate = () => {
    if (!title) return;
    if (onSubmit) {
      onSubmit({
        title,
        domain: domain || "Web Development",
        tags: tags ? tags.split(",").map(t => t.trim()) : ["NEW"],
        marks: criteria.reduce((sum, c) => sum + (parseInt(c.marks) || 0), 0) || 100,
        submissionType: "FILE UPLOAD"
      });
    }
    setTitle("");
    setDescription("");
    setCriteria([{ name: "Code Quality and Best Practices", marks: "0" }, { name: "Documentation and Readability", marks: "0" }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative my-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Create New Assignment
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8">
          
          {/* SECTION 1 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-blue-500" />
              <h3 className="text-xs font-bold text-blue-500 tracking-widest uppercase">
                Assignment Information
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignment Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Web Ethics"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Domains</label>
                  <select 
                    multiple
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-500 h-24"
                    onChange={(e) => setDomain(e.target.value)}
                  >
                    <option>Web Development</option>
                    <option>Data Science</option>
                    <option>Design</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium tracking-wide">Hold Ctrl/Cmd to select multiple</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                  <select 
                    multiple
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-500 h-24"
                    onChange={(e) => setTags(e.target.value)}
                  >
                    <option>FRONTEND</option>
                    <option>BACKEND</option>
                    <option>DATABASE</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium tracking-wide">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition">
                  <div className="bg-gray-50/50 border-b border-gray-200 px-3 py-2 flex items-center gap-1">
                    <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition"><Bold size={14} /></button>
                    <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition"><Italic size={14} /></button>
                    <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition"><List size={14} /></button>
                    <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition"><LinkIcon size={14} /></button>
                    <div className="flex-1"></div>
                    <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition"><Code size={14} /></button>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the assignment objectives, requirements, and instructions..."
                    className="w-full px-4 py-3 text-sm outline-none min-h-[120px] resize-y"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 2 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid size={16} className="text-blue-500" />
              <h3 className="text-xs font-bold text-blue-500 tracking-widest uppercase">
                Evaluation Matrix
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-1">
                <div className="col-span-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Criteria Name</div>
                <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marks</div>
              </div>

              {criteria.map((c, i) => (
                <div key={i} className="grid grid-cols-12 gap-4">
                  <div className="col-span-10">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => handleUpdateCriteria(i, "name", e.target.value)}
                      placeholder="e.g. Code Quality and Best Practices"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={c.marks}
                      onChange={(e) => handleUpdateCriteria(i, "marks", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={handleAddCriteria}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition mt-2"
              >
                <Plus size={16} /> ADD CRITERIA
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            disabled={!title}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            Create Assignment
          </button>
        </div>

      </div>
    </div>
  );
}
