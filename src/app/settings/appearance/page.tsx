"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null; // or a skeleton
  }

  return (
    <div className="bg-card text-card-foreground border rounded-xl overflow-hidden flex flex-col">
      <div className="p-8 pb-6">
        <h2 className="text-xl font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Customize the appearance of the application. Automatically switch between light and dark themes.
        </p>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">
              Select the theme for the dashboard.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 max-w-2xl">
              {/* Light Theme Option */}
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  theme === "light" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Sun className="w-6 h-6 text-slate-900" />
                </div>
                <span className="font-medium text-sm">Light</span>
              </button>

              {/* Dark Theme Option */}
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  theme === "dark" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3 border border-slate-800">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-sm">Dark</span>
              </button>

              {/* System Theme Option */}
              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                  theme === "system" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-200 to-slate-800 flex items-center justify-center mb-3">
                  <Monitor className="w-6 h-6 text-white mix-blend-difference" />
                </div>
                <span className="font-medium text-sm">System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t bg-muted/50 flex items-center justify-end gap-4 mt-auto">
        <Button variant="ghost">Discard</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
