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
      <div className="p-4 md:p-8 md:pb-6">
        <h2 className="text-xl font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-muted-foreground mb-6 md:mb-8">
          Customize the appearance of the application. Automatically switch between light and dark themes.
        </p>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">
              Select the theme for the dashboard.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Light Theme */}
              <button
                onClick={() => setTheme("light")}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all hover:bg-accent/50 ${
                  theme === "light" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <div className="mb-3 rounded-full bg-orange-100 p-2.5 text-orange-600">
                  <Sun className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Light</span>
                {theme === "light" && (
                  <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-primary"></span>
                )}
              </button>

              {/* Dark Theme */}
              <button
                onClick={() => setTheme("dark")}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all hover:bg-accent/50 ${
                  theme === "dark" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <div className="mb-3 rounded-full bg-slate-800 p-2.5 text-slate-300">
                  <Moon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Dark</span>
                {theme === "dark" && (
                  <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-primary"></span>
                )}
              </button>

              {/* System Theme */}
              <button
                onClick={() => setTheme("system")}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all hover:bg-accent/50 ${
                  theme === "system" ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                <div className="mb-3 rounded-full bg-blue-100 dark:bg-blue-900 p-2.5 text-blue-600 dark:text-blue-300">
                  <Monitor className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">System</span>
                {theme === "system" && (
                  <span className="absolute right-3 top-3 flex h-2 w-2 rounded-full bg-primary"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* <div className="p-4 md:p-6 border-t bg-muted/50 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-auto">
        <Button className="w-full sm:w-auto" variant="ghost" onClick={() => toast.success("Appearance settings discarded (demo)")}>
          Discard
        </Button>
        <Button className="w-full sm:w-auto" onClick={() => toast.success("Appearance settings saved successfully.")}>
          Save Changes
        </Button>
      </div> */}
    </div>
  );
}
