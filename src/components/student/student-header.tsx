"use client";

import { Bell } from "lucide-react";

export default function StudentHeader() {
  return (
    <header className="h-20 px-8 flex items-center justify-between bg-white border-b border-gray-100 shrink-0">
      <div className="flex-1 max-w-xl">
        {/* Placeholder for search or breadcrumbs if needed */}
      </div>
      
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">Alex Thompson</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">ID: ST-2024-001</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
            AT
          </div>
        </div>
      </div>
    </header>
  );
}
