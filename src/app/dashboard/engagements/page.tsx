"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { Plus, MoreVertical, Play, Pause, Copy, Trash2, Eye, MousePointerClick, TrendingUp, BarChart3 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface Engagement {
  id: string;
  name: string;
  type: string;
  status: "active" | "paused" | "draft" | "completed";
  impressions: number;
  clicks: number;
  conversions: number;
  created_at: string;
  updated_at: string;
  config: Record<string, unknown>;
}

const statusColors = {
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  draft: "bg-gray-100 text-gray-500",
  completed: "bg-blue-50 text-blue-600",
};

const typeGradients: Record<string, string> = {
  "Exit Popup": "from-red-500 to-orange-500",
  "Announcement Bar": "from-blue-500 to-cyan-500",
  "Product Bundle": "from-amber-500 to-yellow-500",
  "Cart Popup": "from-purple-500 to-pink-500",
  "Social Proof": "from-green-500 to-emerald-500",
  "Trust Bar": "from-indigo-500 to-violet-500",
};

export default function EngagementsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [engagements, setEngagements] = useState<Engagement[]>([]);

  const fetchEngagements = useCallback(async () => {
    try {
      const res = await fetch("/api/engage");
      const data = await res.json();
      setEngagements(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchEngagements();
    const interval = setInterval(fetchEngagements, 5000);
    return () => clearInterval(interval);
  }, [fetchEngagements]);

  const filtered = filter === "all" ? engagements : engagements.filter((e) => e.status === filter);

  const totalImpressions = engagements.reduce((s, e) => s + e.impressions, 0);
  const totalClicks = engagements.reduce((s, e) => s + e.clicks, 0);
  const totalConversions = engagements.reduce((s, e) => s + e.conversions, 0);
  const avgCR = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : "0.0";

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return `${Math.round(diff / 86400000)}d ago`;
  }

  return (
    <div>
      <Header title="Engagements" />
      <div className="p-6 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["all", "active", "paused", "draft", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
                {f !== "all" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({engagements.filter((e) => e.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <Link
            href="/dashboard/builder"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" /> New Engagement
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Impressions", value: totalImpressions.toLocaleString(), icon: Eye, color: "text-blue-500" },
            { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-purple-500" },
            { label: "Total Conversions", value: totalConversions.toLocaleString(), icon: TrendingUp, color: "text-success" },
            { label: "Avg. CR", value: `${avgCR}%`, icon: BarChart3, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-card-bg rounded-xl border border-border p-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Engagement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((eng) => {
            const cr = eng.impressions > 0 ? ((eng.conversions / eng.impressions) * 100).toFixed(1) + "%" : "—";
            const gradient = typeGradients[eng.type] || "from-gray-500 to-gray-600";
            return (
              <div
                key={eng.id}
                className="bg-card-bg rounded-xl border border-border hover:shadow-md hover:border-primary/20 transition-all animate-fadeIn group"
              >
                {/* Thumbnail */}
                <div className={`h-32 bg-gradient-to-br ${gradient} rounded-t-xl relative`}>
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusColors[eng.status]}`}>
                    {eng.status}
                  </span>
                  <div className="absolute top-3 right-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === eng.id ? null : eng.id)}
                      className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                    {openMenu === eng.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-border py-1 w-40 z-10">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">
                          {eng.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {eng.status === "active" ? "Pause" : "Activate"}
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">
                          <Copy className="w-3.5 h-3.5" /> Duplicate
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Live counter badge */}
                  {eng.impressions > 0 && (
                    <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-md">
                      {eng.impressions} shown
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{eng.type}</p>
                  <h3 className="font-semibold text-foreground text-sm">{eng.name}</h3>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Impressions</p>
                      <p className="text-sm font-semibold">{eng.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Clicks</p>
                      <p className="text-sm font-semibold">{eng.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">CR</p>
                      <p className="text-sm font-semibold text-success">{cr}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-3">Updated {timeAgo(new Date(eng.updated_at).getTime())}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
