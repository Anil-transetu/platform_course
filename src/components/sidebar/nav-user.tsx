"use client";
import Image from "next/image";

export default function NavUser() {
  return (
    <div className="p-4 border-t border-[#2a374a] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-600">
          <Image 
            src="https://ui-avatars.com/api/?name=Alex+Thompson&background=random" 
            alt="User" 
            width={40}
            height={40}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-white">Alex Thompson</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Super Admin</p>
        </div>
      </div>

      <button
        className="text-gray-400 hover:text-white transition-colors"
        onClick={() => {
          document.cookie = "mock_auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          window.location.href = "/login";
        }}
        title="Sign out"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  );
}

