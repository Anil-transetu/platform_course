"use client";

import NavMain from "./nav-main";
import NavUser from "./nav-user";

export default function AppSidebar() {
  return (
    <aside className="w-64 shrink-0 bg-[#1B2533] text-white flex flex-col justify-between h-screen shadow-xl">
      <div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">LMS Admin</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Management Portal</p>
            </div>
          </div>
        </div>

        <NavMain />
      </div>

      <NavUser />
    </aside>
  );
}

