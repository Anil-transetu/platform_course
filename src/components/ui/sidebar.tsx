"use client";

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {children}
    </aside>
  );
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 border-b border-slate-700 text-lg font-semibold">
      {children}
    </div>
  );
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 p-4 space-y-2">
      {children}
    </div>
  );
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border-t border-slate-700">
      {children}
    </div>
  );
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2">
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

export function SidebarMenuButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition">
      {children}
    </button>
  );
}
