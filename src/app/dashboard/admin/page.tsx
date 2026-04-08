"use client";

import Header from "@/components/Header";
import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Phone, Mail, MapPin, Monitor, Smartphone, ArrowLeft, Clock, MousePointerClick, ShoppingCart, Fingerprint, RefreshCw, Users, UserCheck, PhoneCall } from "lucide-react";

interface Visitor {
  id: string;
  fingerprint_id: string;
  confidence: number;
  session_id: string;
  is_returning: number;
  visit_count: number;
  first_seen: number;
  last_seen: number;
  intent: string;
  intent_score: number;
  page_views: number;
  time_on_site: number;
  scroll_depth: number;
  click_count: number;
  cart_items: number;
  cart_value: number;
  source: string;
  device: string;
  entry_page: string;
  current_page: string;
  pages: string[];
  email: string | null;
  phone: string | null;
  ip: string;
  is_logged_in: number;
  shopify_orders_count: number;
  customer_tier: string;
  converted: number;
  engagements_shown: string[];
}

interface Event {
  id: string;
  visitor_id: string;
  event: string;
  data: Record<string, unknown>;
  page: string;
  timestamp: number;
}

interface Contact {
  id: number;
  visitor_id: string;
  phone: string;
  email: string;
  wa_consent: number;
  consent_timestamp: string;
  capture_method: string;
  quiz_answers: string[];
  recommendation: string;
  intent: string;
  source: string;
  created_at: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<"visitors" | "journey" | "contacts">("visitors");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<string | null>(null);
  const [journey, setJourney] = useState<{ visitor: Visitor | null; events: Event[] } | null>(null);
  const [search, setSearch] = useState("");
  const [filterIntent, setFilterIntent] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchVisitors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/journey");
      if (res.ok) setVisitors(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/contacts");
      if (res.ok) setContacts(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchJourney = useCallback(async (id: string) => {
    setLoading(true);
    setSelectedVisitor(id);
    setTab("journey");
    try {
      const res = await fetch(`/api/admin/journey?id=${encodeURIComponent(id)}`);
      if (res.ok) setJourney(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVisitors();
    fetchContacts();
    const interval = setInterval(() => {
      fetchVisitors();
      fetchContacts();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchVisitors, fetchContacts]);

  const filteredVisitors = visitors.filter((v) => {
    if (search && !v.id.includes(search) && !v.fingerprint_id?.includes(search) && !v.ip?.includes(search) && !v.email?.includes(search) && !v.phone?.includes(search)) return false;
    if (filterIntent !== "all" && v.intent !== filterIntent) return false;
    if (filterSource !== "all" && v.source !== filterSource) return false;
    return true;
  });

  const sources = [...new Set(visitors.map((v) => v.source))];

  function timeAgo(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return `${Math.round(diff / 86400000)}d ago`;
  }

  function eventIcon(event: string) {
    const icons: Record<string, string> = {
      page_view: "📄", heartbeat: "💓", intent_changed: "🎯", cart_updated: "🛒",
      exit_intent: "🚪", engagement_shown: "👁️", engagement_clicked: "👆",
      engagement_converted: "✅", engagement_dismissed: "❌", contact_captured: "📱",
      customer_identified: "🏪", quiz_answer: "❓", link_click: "🔗", button_click: "🔘",
      conversion: "💰",
    };
    return icons[event] || "⚡";
  }

  function eventColor(event: string) {
    if (event.includes("converted") || event === "conversion" || event === "contact_captured") return "bg-green-100 border-green-300";
    if (event.includes("clicked") || event === "quiz_answer") return "bg-blue-100 border-blue-300";
    if (event.includes("shown")) return "bg-purple-100 border-purple-300";
    if (event === "exit_intent") return "bg-red-100 border-red-300";
    if (event === "intent_changed") return "bg-amber-100 border-amber-300";
    return "bg-gray-50 border-gray-200";
  }

  return (
    <div>
      <Header title="Admin Panel" />
      <div className="p-6 space-y-6">
        {/* Tab Bar */}
        <div className="flex items-center gap-2">
          {selectedVisitor && tab === "journey" && (
            <button onClick={() => { setTab("visitors"); setSelectedVisitor(null); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mr-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {[
            { id: "visitors" as const, label: "All Visitors", icon: Users, count: visitors.length },
            { id: "contacts" as const, label: "Captured Contacts", icon: PhoneCall, count: contacts.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className="text-xs opacity-70">({t.count})</span>
            </button>
          ))}
          <button onClick={() => { fetchVisitors(); fetchContacts(); }} className="ml-auto p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ─── Visitors Tab ─── */}
        {tab === "visitors" && (
          <>
            {/* Filters */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, fingerprint, IP, email, phone..."
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-card-bg"
                />
              </div>
              <select value={filterIntent} onChange={(e) => setFilterIntent(e.target.value)} className="border border-border rounded-lg px-3 py-2.5 text-sm bg-card-bg">
                <option value="all">All Intent</option>
                <option value="low">🔴 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟢 High</option>
              </select>
              <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="border border-border rounded-lg px-3 py-2.5 text-sm bg-card-bg">
                <option value="all">All Sources</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-card-bg rounded-xl border border-border p-4">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold">{visitors.length}</p>
              </div>
              <div className="bg-card-bg rounded-xl border border-border p-4">
                <p className="text-xs text-gray-500">New</p>
                <p className="text-xl font-bold text-emerald-600">{visitors.filter((v) => !v.is_returning).length}</p>
              </div>
              <div className="bg-card-bg rounded-xl border border-border p-4">
                <p className="text-xs text-gray-500">Returning</p>
                <p className="text-xl font-bold text-blue-600">{visitors.filter((v) => v.is_returning).length}</p>
              </div>
              <div className="bg-card-bg rounded-xl border border-border p-4">
                <p className="text-xs text-gray-500">High Intent</p>
                <p className="text-xl font-bold text-green-600">{visitors.filter((v) => v.intent === "high").length}</p>
              </div>
              <div className="bg-card-bg rounded-xl border border-border p-4">
                <p className="text-xs text-gray-500">Converted</p>
                <p className="text-xl font-bold text-primary">{visitors.filter((v) => v.converted).length}</p>
              </div>
            </div>

            {/* Visitor Table */}
            <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-border bg-gray-50/50">
                      <th className="px-4 py-3 font-medium">Visitor</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Intent</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Pages</th>
                      <th className="px-4 py-3 font-medium">Cart</th>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Last Seen</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVisitors.map((v) => (
                      <tr key={v.id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-gray-700">{v.id.substring(0, 20)}...</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Fingerprint className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] text-gray-400">{v.fingerprint_id?.substring(0, 12) || "—"}... ({Math.round(v.confidence * 100)}%)</span>
                          </div>
                          {v.ip && <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{v.ip}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.is_returning ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {v.is_returning ? `Return #${v.visit_count}` : "New"}
                          </span>
                          {v.is_logged_in ? <span className="text-[10px] ml-1 text-amber-600">Shopify</span> : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            v.intent === "high" ? "bg-green-100 text-green-700" : v.intent === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          }`}>
                            {v.intent} ({v.intent_score})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{v.source}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600">{v.page_views} pages</div>
                          <div className="text-[10px] text-gray-400">{v.time_on_site}s • {v.scroll_depth}% scroll</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {v.cart_items > 0 ? (
                            <span className="text-green-600 font-medium">{v.cart_items} items (₹{v.cart_value})</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {v.phone && <div className="text-xs text-green-600 flex items-center gap-1"><Phone className="w-3 h-3" />{v.phone}</div>}
                          {v.email && <div className="text-xs text-blue-600 flex items-center gap-1"><Mail className="w-3 h-3" />{v.email}</div>}
                          {!v.phone && !v.email && <span className="text-xs text-gray-400">Anonymous</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(Number(v.last_seen))}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => fetchJourney(v.id)}
                            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" /> Journey
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredVisitors.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">No visitors yet. Go to /demo and browse around!</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ─── Journey Tab ─── */}
        {tab === "journey" && journey && (
          <div className="grid grid-cols-3 gap-6">
            {/* Visitor Profile */}
            <div className="bg-card-bg rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Visitor Profile</h3>
              {journey.visitor && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">ID</p>
                    <p className="font-mono text-xs break-all">{journey.visitor.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Fingerprint</p>
                    <p className="font-mono text-xs">{journey.visitor.fingerprint_id || "—"}</p>
                    <p className="text-[10px] text-gray-400">{Math.round(journey.visitor.confidence * 100)}% confidence</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${journey.visitor.is_returning ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {journey.visitor.is_returning ? `Returning (#${journey.visitor.visit_count})` : "New Visitor"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tier</p>
                      <p className="font-medium capitalize">{journey.visitor.customer_tier}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Intent</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        journey.visitor.intent === "high" ? "bg-green-100 text-green-700" : journey.visitor.intent === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>{journey.visitor.intent} ({journey.visitor.intent_score})</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Source</p>
                      <p>{journey.visitor.source}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div><p className="text-xs text-gray-400">Device</p><p className="flex items-center gap-1">{journey.visitor.device === "mobile" ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}{journey.visitor.device}</p></div>
                    <div><p className="text-xs text-gray-400">IP</p><p>{journey.visitor.ip || "—"}</p></div>
                  </div>
                  <hr className="border-border" />
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-gray-400">Pages</p><p className="font-semibold">{journey.visitor.page_views}</p></div>
                    <div><p className="text-xs text-gray-400">Time</p><p className="font-semibold">{journey.visitor.time_on_site}s</p></div>
                    <div><p className="text-xs text-gray-400">Scroll</p><p className="font-semibold">{journey.visitor.scroll_depth}%</p></div>
                    <div><p className="text-xs text-gray-400">Clicks</p><p className="font-semibold">{journey.visitor.click_count}</p></div>
                  </div>
                  {journey.visitor.cart_items > 0 && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5" /> Cart</p>
                      <p className="font-bold text-green-700">{journey.visitor.cart_items} items — ₹{journey.visitor.cart_value}</p>
                    </div>
                  )}
                  <hr className="border-border" />
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Contact Info</p>
                    {journey.visitor.phone && <p className="text-green-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{journey.visitor.phone}</p>}
                    {journey.visitor.email && <p className="text-blue-600 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{journey.visitor.email}</p>}
                    {!journey.visitor.phone && !journey.visitor.email && <p className="text-gray-400">No contact captured yet</p>}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pages Visited</p>
                    <div className="space-y-1">
                      {(journey.visitor.pages || []).map((p, i) => (
                        <div key={i} className="text-xs text-primary font-mono bg-primary/5 px-2 py-1 rounded">{p}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Timeline */}
            <div className="col-span-2 bg-card-bg rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Event Timeline</h3>
                <span className="text-xs text-gray-400">{journey.events.length} events</span>
              </div>
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading journey...</div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                  {journey.events.map((e, i) => (
                    <div key={e.id || i} className={`flex gap-3 p-3 rounded-lg border ${eventColor(e.event)} transition-all hover:shadow-sm`}>
                      <div className="text-xl flex-shrink-0 mt-0.5">{eventIcon(e.event)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-foreground">{e.event.replace(/_/g, " ")}</p>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            {timeAgo(Number(e.timestamp))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Page: {e.page}</p>
                        {Object.keys(e.data || {}).filter((k) => k !== "_ip").length > 0 && (
                          <div className="mt-2 bg-white/60 rounded p-2 text-xs font-mono text-gray-600 break-all">
                            {Object.entries(e.data || {}).filter(([k]) => k !== "_ip").map(([k, v]) => (
                              <div key={k}><span className="text-gray-400">{k}:</span> {typeof v === "object" ? JSON.stringify(v) : String(v)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {journey.events.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">No events recorded for this visitor</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Contacts Tab ─── */}
        {tab === "contacts" && (
          <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-border bg-gray-50/50">
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">WA Consent</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Intent</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Recommendation</th>
                    <th className="px-4 py-3 font-medium">Captured</th>
                    <th className="px-4 py-3 font-medium">Journey</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-green-600">{c.phone || "—"}</td>
                      <td className="px-4 py-3 text-blue-600">{c.email || "—"}</td>
                      <td className="px-4 py-3">
                        {c.wa_consent ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Consented</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">✗ No consent</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs capitalize">{c.capture_method || "popup"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.intent === "high" ? "bg-green-100 text-green-700" : c.intent === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>{c.intent}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">{c.source}</td>
                      <td className="px-4 py-3 text-xs text-purple-600">{c.recommendation || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleString("en-IN") : "—"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => fetchJourney(c.visitor_id)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contacts.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">No contacts captured yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
