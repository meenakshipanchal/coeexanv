"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-card-bg rounded-xl border border-border p-5 hover:shadow-md transition-shadow animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 text-success" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-danger" />
            )}
            <span className={`text-xs font-medium ${trend === "up" ? "text-success" : "text-danger"}`}>
              {change}
            </span>
            <span className="text-xs text-gray-400 ml-1">vs last week</span>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
