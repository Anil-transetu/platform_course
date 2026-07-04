import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 pt-8">
        {/* Content Area */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 mt-6 md:mt-10 pb-16">
          {/* Settings Sidebar - Hidden on mobile */}
          <div className="hidden md:block">
            <SettingsNav />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
