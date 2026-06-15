import Image from "next/image";
import { Share2 } from "lucide-react";
import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white">
      {/* Banner / Header */}
      <div className="w-full h-48 bg-gradient-to-r from-[#0066FF] via-[#5200FF] to-[#9E00FF] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1115] opacity-80"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-8 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#2a374a] gap-4">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0f1115] shadow-lg bg-[#0f1115]">
              <Image 
                src="https://ui-avatars.com/api/?name=Anil+Sai&background=random" 
                alt="Profile" 
                width={128} 
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pb-2">
              <h1 className="text-3xl font-bold mb-1 tracking-tight">ANIL SAI NUNNA</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>@ANIL</span>
                <span className="px-2.5 py-0.5 bg-white dark:bg-card/10 text-white rounded-full text-[11px] font-medium tracking-wide">Pro Plan</span>
              </div>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-transparent hover:bg-white dark:bg-card/5 border border-white/20 rounded-lg text-sm font-medium transition-colors md:mb-2 w-fit">
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row gap-12 mt-10 pb-16">
          {/* Settings Sidebar */}
          <SettingsNav />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
