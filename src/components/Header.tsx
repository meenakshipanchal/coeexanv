"use client";

import { Bell, Search, Plus } from "lucide-react";
import Link from "next/link";

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-16 bg-card-bg border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* New Engagement */}
        <Link
          href="/dashboard/builder"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Engagement
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>
      </div>
    </header>
  );
}
