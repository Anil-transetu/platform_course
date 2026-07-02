import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Banner / Header */}
      <div className="w-full h-48 bg-gradient-to-r from-[#0066FF] via-[#5200FF] to-[#9E00FF] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background opacity-80"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-8 -mt-8 relative z-10">
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
