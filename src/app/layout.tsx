import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export const metadata = {
  title: "Admin Dashboard",
  description: "LMS Admin Panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const orig = console.error;
              console.error = function(...args) {
                if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) return;
                orig.apply(console, args);
              };
            `
          }}
        />
      </head>
      <body className="bg-background text-foreground m-0 p-0 antialiased min-h-screen" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              <Toaster position="top-right" />
              {children}
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

