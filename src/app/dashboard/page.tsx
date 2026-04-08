"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { Users, Eye, MousePointerClick, ShoppingCart, TrendingUp, Target, ArrowRight, Radio, Wifi } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Analytics {
  totalVisitors: number;
  todayVisitors: number;
  activeNow: number;
  totalPageViews: number;
  avgSessionDuration: number;
  conversionRate: string;
  intentDistribution: { low: number; medium: number; high: number };
  sourceDistribution: Record<string, number>;
  funnel: { landing: number; productView: number; addToCart: number; checkout: number; converted: number };
  engagements: { totalImpressions: number; totalClicks: number; totalConversions: number; avgCR: string };
  dailyData: { date: string; visitors: number; sessions: number; engaged: number; converted: number }[];
  recentEvents: { id: string; visitorId: string; event: string; data: Record<string, unknown>; page: string; timestamp: number }[];
}

interface Visitor {
  id: string;
  fingerprint_id: string;
  confidence: number;
  is_returning: number;
  visit_count: number;
  intent: string;
  intent_score: number;
  source: string;
  device: string;
  current_page: string;
  page_views: number;
  time_on_site: number;
  cart_items: number;
  cart_value: number;
  last_seen: number;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [liveVisitors, setLiveVisitors] = useState<Visitor[]>([]);
  const [engagements, setEngagements] = useState<{ name: string; type: string; impressions: number; clicks: number; conversions: number }[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, visitorsRes, engagementsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/visitors?filter=active"),
        fetch("/api/engage"),
      ]);
      const a = await analyticsRes.json();
      const v = await visitorsRes.json();
      const e = await engagementsRes.json();
      setAnalytics(a);
      setLiveVisitors(v);
      setEngagements(e);
    } catch {
      // Silently fail on fetch errors
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Format data for charts
  const intentData = analytics ? [
    { name: "Low Intent", value: analytics.intentDistribution.low || 1, color: "#ef4444" },
    { name: "Medium Intent", value: analytics.intentDistribution.medium || 0, color: "#f59e0b" },
    { name: "High Intent", value: analytics.intentDistribution.high || 0, color: "#22c55e" },
  ] : [
    { name: "Low Intent", value: 1, color: "#ef4444" },
    { name: "Medium Intent", value: 0, color: "#f59e0b" },
    { name: "High Intent", value: 0, color: "#22c55e" },
  ];

  const engagementPerformance = engagements.map((e) => ({
    name: e.type || e.name,
    impressions: e.impressions,
    clicks: e.clicks,
    conversions: e.conversions,
  }));

  const trafficData = analytics?.dailyData || [];

  const recentEvents = (analytics?.recentEvents || []).slice(0, 8).map((e: Record<string, unknown>) => {
    const eventLabels: Record<string, { action: string; type: string }> = {
      page_view: { action: "Page viewed", type: "create" },
      intent_changed: { action: "Intent changed", type: "alert" },
      cart_updated: { action: "Cart updated", type: "create" },
      engagement_shown: { action: "Engagement shown", type: "create" },
      engagement_clicked: { action: "Engagement clicked", type: "test" },
      engagement_converted: { action: "Conversion!", type: "test" },
      exit_intent: { action: "Exit intent detected", type: "alert" },
      heartbeat: { action: "Visitor active", type: "pause" },
    };
    const eventName = (e.event as string) || "";
    const vid = (e.visitorId || e.visitor_id || "unknown") as string;
    const page = (e.page as string) || "/";
    const ts = Number(e.timestamp) || Date.now();
    const label = eventLabels[eventName] || { action: eventName, type: "pause" };
    const ago = Math.round((Date.now() - ts) / 1000);
    const timeStr = ago < 60 ? `${ago}s ago` : ago < 3600 ? `${Math.round(ago / 60)}m ago` : `${Math.round(ago / 3600)}h ago`;
    return {
      action: label.action,
      detail: `${vid.substring(0, 12)}... on ${page}`,
      time: timeStr,
      type: label.type,
    };
  });

  const totalVisitors = analytics?.totalVisitors || 0;
  const totalPageViews = analytics?.totalPageViews || 0;
  const totalImpressions = analytics?.engagements.totalImpressions || 0;
  const totalConversions = analytics?.engagements.totalConversions || 0;

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">Welcome back, Meenakshi!</h1>
            <p className="text-white/80 mt-1 text-sm">
              {totalVisitors > 0 ? (
                <>
                  Your store had <span className="font-semibold text-white">{totalVisitors.toLocaleString()} visitors</span> with a{" "}
                  <span className="font-semibold text-white">{analytics?.conversionRate || "0"}% conversion rate</span>
                </>
              ) : (
                <>Install the SDK on your website to start tracking visitors in real-time</>
              )}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Link
                href="/dashboard/builder"
                className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Create Engagement
              </Link>
              <Link
                href="/dashboard/analytics"
                className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                View Analytics
              </Link>
              {analytics && analytics.activeNow > 0 && (
                <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-medium">{analytics.activeNow} live now</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Visitors"
            value={totalVisitors.toLocaleString()}
            change={totalVisitors > 0 ? "live" : "—"}
            trend="up"
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Page Views"
            value={totalPageViews.toLocaleString()}
            change={totalPageViews > 0 ? "live" : "—"}
            trend="up"
            icon={Eye}
            color="bg-purple-500"
          />
          <StatCard
            title="Engagements Shown"
            value={totalImpressions.toLocaleString()}
            change={totalImpressions > 0 ? "live" : "—"}
            trend="up"
            icon={MousePointerClick}
            color="bg-primary"
          />
          <StatCard
            title="Conversions"
            value={totalConversions.toLocaleString()}
            change={analytics?.engagements.avgCR ? `${analytics.engagements.avgCR}% CR` : "—"}
            trend="up"
            icon={ShoppingCart}
            color="bg-success"
          />
        </div>

        {/* Live Visitors Panel */}
        {liveVisitors.length > 0 && (
          <div className="bg-card-bg rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
              <h3 className="font-semibold text-foreground">Live Visitors</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{liveVisitors.length} online</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-border">
                    <th className="pb-2 font-medium">Visitor</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Page</th>
                    <th className="pb-2 font-medium">Intent</th>
                    <th className="pb-2 font-medium">Source</th>
                    <th className="pb-2 font-medium">Device</th>
                    <th className="pb-2 font-medium">Cart</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {liveVisitors.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-gray-50 animate-fadeIn">
                      <td className="py-2.5">
                        <div className="font-mono text-xs">{v.id.substring(0, 15)}...</div>
                        {v.confidence > 0 && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            FP: {Math.round(v.confidence * 100)}% match
                          </div>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          v.is_returning ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {v.is_returning ? `Return #${v.visit_count}` : "New"}
                        </span>
                      </td>
                      <td className="py-2.5 text-primary text-xs">{v.current_page}</td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          v.intent === "high" ? "bg-green-100 text-green-700" :
                          v.intent === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {v.intent} ({v.intent_score})
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-600 text-xs">{v.source}</td>
                      <td className="py-2.5 text-gray-600 text-xs">{v.device}</td>
                      <td className="py-2.5 text-gray-600 text-xs">
                        {v.cart_items > 0 ? `${v.cart_items} items (₹${v.cart_value})` : "—"}
                      </td>
                      <td className="py-2.5 text-gray-600 text-xs">{Math.round(v.time_on_site)}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Chart */}
          <div className="lg:col-span-2 bg-card-bg rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Traffic & Conversions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 7 days performance</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Visitors
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-light" /> Engaged
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" /> Converted
                </span>
              </div>
            </div>
            {trafficData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="visitors" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="engaged" stroke="#818cf8" fill="#818cf8" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="converted" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                <div className="text-center">
                  <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No traffic data yet</p>
                  <p className="text-xs mt-1">Install the SDK to start collecting data</p>
                </div>
              </div>
            )}
          </div>

          {/* Intent Pie */}
          <div className="bg-card-bg rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-1">Visitor Intent</h3>
            <p className="text-xs text-gray-500 mb-4">Real-time buying intent distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={intentData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {intentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {intentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Performance & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Engagement Performance */}
          <div className="lg:col-span-2 bg-card-bg rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">Engagement Performance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Impressions, clicks & conversions by type</p>
              </div>
              <Link href="/dashboard/engagements" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {engagementPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={engagementPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="impressions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
                Engagement data will appear here as visitors interact
              </div>
            )}
          </div>

          {/* Live Event Feed */}
          <div className="bg-card-bg rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-foreground">Live Activity</h3>
              {recentEvents.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </div>
            {recentEvents.length > 0 ? (
              <div className="space-y-4 max-h-[280px] overflow-y-auto">
                {recentEvents.map((activity, i) => (
                  <div key={i} className="flex gap-3 animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activity.type === "create" ? "bg-primary" :
                      activity.type === "test" ? "bg-success" :
                      activity.type === "alert" ? "bg-warning" :
                      "bg-gray-400"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.detail}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm text-center">
                <div>
                  <p>Waiting for events...</p>
                  <p className="text-xs mt-1">Events will stream in real-time as visitors interact</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Create Popup", href: "/dashboard/builder", icon: MousePointerClick, color: "bg-primary/10 text-primary" },
              { label: "View Analytics", href: "/dashboard/analytics", icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
              { label: "Setup Branding", href: "/dashboard/branding", icon: Target, color: "bg-purple-50 text-purple-600" },
              { label: "Install SDK", href: "/dashboard/sdk", icon: ShoppingCart, color: "bg-green-50 text-green-600" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
