"use client";

import React from "react";
import { Plus, X } from "lucide-react";

export interface EvaluationCriteria {
  name: string;
  marks: number | string;
}

interface Props {
  criteria: EvaluationCriteria[];
  onChange: (criteria: EvaluationCriteria[]) => void;
  error?: string;
}

export default function EvaluationMatrixBuilder({ criteria, onChange, error }: Props) {
  const handleAddCriteria = () => {
    onChange([...criteria, { name: "", marks: "0" }]);
  };

  const handleUpdateCriteria = (index: number, field: keyof EvaluationCriteria, value: string) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemoveCriteria = (index: number) => {
    const updated = [...criteria];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {criteria.length > 0 && (
        <div className="grid grid-cols-12 gap-4 px-1">
          <div className="col-span-8 md:col-span-9 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Criteria Name</div>
          <div className="col-span-3 md:col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Marks</div>
          <div className="col-span-1"></div>
        </div>
      )}

      {criteria.map((c, i) => (
        <div key={i} className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-8 md:col-span-9">
            <input
              type="text"
              value={c.name}
              onChange={(e) => handleUpdateCriteria(i, "name", e.target.value)}
              placeholder="e.g. Code Quality and Best Practices"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
          <div className="col-span-3 md:col-span-2">
            <input
              type="number"
              value={c.marks}
              onChange={(e) => handleUpdateCriteria(i, "marks", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              min="0"
            />
          </div>
          <div className="col-span-1 flex justify-center">
            <button
              type="button"
              onClick={() => handleRemoveCriteria(i)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              aria-label="Remove criteria"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}

      {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}

      <button
        type="button"
        onClick={handleAddCriteria}
        className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition mt-2"
      >
        <Plus size={16} /> ADD CRITERIA
      </button>
    </div>
  );
}
