"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Palette,
  Code2,
  MousePointerClick,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/engagements", label: "Engagements", icon: Megaphone },
  { href: "/dashboard/builder", label: "Builder", icon: MousePointerClick },
  { href: "/dashboard/branding", label: "Branding", icon: Palette },
  { href: "/dashboard/sdk", label: "SDK Setup", icon: Code2 },
  { href: "/dashboard/admin", label: "Admin Panel", icon: ShieldCheck },
];

const bottomItems = [
  { href: "#", label: "Settings", icon: Settings },
  { href: "#", label: "Help", icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar-bg min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">Cooee</h1>
          <p className="text-sidebar-text text-[11px] opacity-70">for Anveshan</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4">
        <p className="text-sidebar-text/50 text-[10px] uppercase tracking-widest font-semibold px-3 mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-sidebar-text hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium text-sidebar-text hover:bg-white/10 hover:text-white transition-all"
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </Link>
        ))}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all w-full">
          <LogOut className="w-[18px] h-[18px]" />
          Logout
        </button>
      </div>

      {/* User */}
      <div className="px-4 pb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-white text-sm font-bold">
          M
        </div>
        <div>
          <p className="text-white text-sm font-medium">Meenakshi</p>
          <p className="text-sidebar-text text-[11px] opacity-60">Admin</p>
        </div>
      </div>
    </aside>
  );
}
