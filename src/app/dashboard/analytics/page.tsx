"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { Users, Eye, Clock, Target, Smartphone, Monitor, UserPlus, UserCheck, ShoppingCart, IndianRupee, Radio } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

interface AnalyticsData {
  stats: { totalVisitors: number; todayVisitors: number; totalPageViews: number; avgSessionDuration: number; conversionRate: string; totalConverted: number };
  sourceData: { name: string; value: number; count: number; color: string }[];
  funnelData: { stage: string; users: number; dropoff: number }[];
  pagePerformance: { page: string; views: number; uniqueVisitors: number }[];
  intentDistribution: { low: number; medium: number; high: number };
  deviceSplit: { mobile: number; desktop: number };
  newVsReturning: { new: number; returning: number };
  dailyData: { date: string; visitors: number; events: number }[];
  cart: { avgValue: number; avgItems: string; totalCarts: number };
  sales: { count: number; revenue: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/detailed");
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const stats = data?.stats;
  const fmtDuration = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
  const hasData = (stats?.totalVisitors || 0) > 0;

  const intentData = data ? [
    { name: "Low Intent", value: data.intentDistribution.low || 0, color: "#ef4444" },
    { name: "Medium Intent", value: data.intentDistribution.medium || 0, color: "#f59e0b" },
    { name: "High Intent", value: data.intentDistribution.high || 0, color: "#22c55e" },
  ] : [];

  const deviceData = data ? [
    { name: "Mobile", value: data.deviceSplit.mobile, color: "#6366f1" },
    { name: "Desktop", value: data.deviceSplit.desktop, color: "#818cf8" },
  ] : [];

  return (
    <div>
      <Header title="Analytics" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Unique Visitors" value={stats?.totalVisitors?.toLocaleString() || "0"} change={stats?.todayVisitors ? `${stats.todayVisitors} today` : "—"} trend="up" icon={Users} color="bg-blue-500" />
          <StatCard title="Page Views" value={stats?.totalPageViews?.toLocaleString() || "0"} change="live" trend="up" icon={Eye} color="bg-purple-500" />
          <StatCard title="Avg. Session" value={fmtDuration(stats?.avgSessionDuration || 0)} change="live" trend="up" icon={Clock} color="bg-amber-500" />
          <StatCard title="Conversion Rate" value={`${stats?.conversionRate || "0.0"}%`} change={`${stats?.totalConverted || 0} converted`} trend="up" icon={Target} color="bg-success" />
        </div>

        {/* Revenue + Cart + New/Returning row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card-bg rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><IndianRupee className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-lg font-bold">₹{(data?.sales.revenue || 0).toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">{data?.sales.count || 0} orders</p>
            </div>
          </div>
          <div className="bg-card-bg rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Avg. Cart Value</p>
              <p className="text-lg font-bold">₹{data?.cart.avgValue || 0}</p>
              <p className="text-[10px] text-gray-400">{data?.cart.avgItems || 0} items avg • {data?.cart.totalCarts || 0} carts</p>
            </div>
          </div>
          <div className="bg-card-bg rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><UserPlus className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-gray-500">New Visitors</p>
              <p className="text-lg font-bold">{data?.newVsReturning.new || 0}</p>
            </div>
          </div>
          <div className="bg-card-bg rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><UserCheck className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Returning Visitors</p>
              <p className="text-lg font-bold">{data?.newVsReturning.returning || 0}</p>
            </div>
          </div>
        </div>

        {/* Traffic + Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card-bg rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-1">Traffic Overview</h3>
            <p className="text-xs text-gray-500 mb-4">Daily unique visitors (last 7 days)</p>
            {(data?.dailyData?.length || 0) > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data!.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="visitors" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="events" stroke="#818cf8" fill="#818cf8" fillOpacity={0.06} strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                <div className="text-center"><Radio className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>Waiting for traffic data...</p></div>
              </div>
            )}
          </div>

          <div className="bg-card-bg rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-1">Traffic Sources</h3>
            <p className="text-xs text-gray-500 mb-4">Where visitors come from</p>
            {(data?.sourceData?.length || 0) > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={data!.sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {data!.sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-3">
                  {data!.sourceData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-gray-600">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{s.value}%</span>
                        <span className="text-xs text-gray-400 ml-1">({s.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No source data yet</div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-1">Conversion Funnel</h3>
          <p className="text-xs text-gray-500 mb-4">Landing → PLP → PDP → Cart → Checkout → Purchase</p>
          {hasData ? (
            <div className="flex items-end gap-4 justify-center py-4">
              {(data?.funnelData || []).map((stage) => {
                const maxUsers = data?.funnelData[0]?.users || 1;
                const widthPercent = (stage.users / maxUsers) * 100;
                return (
                  <div key={stage.stage} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs text-gray-500 font-medium text-center">{stage.stage}</span>
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${Math.max(widthPercent * 2, 30)}px` }}
                    />
                    <span className="text-sm font-bold text-foreground">{stage.users.toLocaleString()}</span>
                    {stage.dropoff > 0 && <span className="text-[10px] text-danger font-medium">-{stage.dropoff}%</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Funnel data will appear as visitors browse</div>
          )}
        </div>

        {/* Intent + Device + Page Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Intent Distribution */}
          <div className="bg-card-bg rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-1">Intent Distribution</h3>
            <p className="text-xs text-gray-500 mb-4">Buying intent of all visitors</p>
            {hasData ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={intentData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {intentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No intent data yet</div>
            )}
          </div>

          {/* Device Split */}
          <div className="bg-card-bg rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-1">Device Split</h3>
            <p className="text-xs text-gray-500 mb-4">Mobile vs Desktop</p>
            {hasData ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {deviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {deviceData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {item.name === "Mobile" ? <Smartphone className="w-4 h-4 text-gray-400" /> : <Monitor className="w-4 h-4 text-gray-400" />}
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No device data yet</div>
            )}
          </div>

          {/* Top Pages */}
          <div className="bg-card-bg rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-1">Top Pages</h3>
            <p className="text-xs text-gray-500 mb-4">Most visited pages</p>
            {(data?.pagePerformance?.length || 0) > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-border">
                      <th className="pb-2 font-medium">Page</th>
                      <th className="pb-2 font-medium">Views</th>
                      <th className="pb-2 font-medium">Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.pagePerformance.map((p) => (
                      <tr key={p.page} className="border-b border-border/50 hover:bg-gray-50">
                        <td className="py-2.5 font-mono text-xs text-primary max-w-[150px] truncate">{p.page}</td>
                        <td className="py-2.5 font-medium">{p.views.toLocaleString()}</td>
                        <td className="py-2.5 text-gray-600">{p.uniqueVisitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No page data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
