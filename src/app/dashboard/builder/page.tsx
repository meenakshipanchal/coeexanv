"use client";

import Header from "@/components/Header";
import { useState } from "react";
import {
  Type,
  Image,
  Square,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  AlignCenter,
  AlignRight,
  Palette,
  Layers,
  MousePointerClick,
  X,
  Gift,
  ShoppingBag,
  Timer,
  Mail,
  Star,
  Percent,
  Save,
  Play,
  Smartphone,
  Monitor,
  Eye,
} from "lucide-react";

const templates = [
  { id: "exit-intent", name: "Exit Intent", icon: MousePointerClick, color: "from-red-500 to-orange-500" },
  { id: "welcome", name: "Welcome Popup", icon: Gift, color: "from-blue-500 to-cyan-500" },
  { id: "bundle", name: "Product Bundle", icon: ShoppingBag, color: "from-purple-500 to-pink-500" },
  { id: "countdown", name: "Countdown Timer", icon: Timer, color: "from-amber-500 to-yellow-500" },
  { id: "newsletter", name: "Newsletter", icon: Mail, color: "from-green-500 to-emerald-500" },
  { id: "review", name: "Review Prompt", icon: Star, color: "from-indigo-500 to-violet-500" },
  { id: "discount", name: "Discount Wheel", icon: Percent, color: "from-pink-500 to-rose-500" },
  { id: "announcement", name: "Announcement Bar", icon: Type, color: "from-teal-500 to-cyan-500" },
];

export default function BuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("exit-intent");
  const [popupTitle, setPopupTitle] = useState("Wait! Don't leave yet!");
  const [popupSubtitle, setPopupSubtitle] = useState("Get 20% off on your first order with code ANVESHAN20");
  const [buttonText, setButtonText] = useState("Claim My Discount");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [showImage, setShowImage] = useState(true);
  const [triggerType, setTriggerType] = useState("exit-intent");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"design" | "trigger" | "targeting">("design");

  return (
    <div>
      <Header title="Engagement Builder" />
      <div className="p-6">
        {/* Template Selector */}
        <div className="bg-card-bg rounded-xl border border-border p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Choose Template</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 min-w-[100px] transition-all ${
                  selectedTemplate === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-gray-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                  <t.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Controls */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["design", "trigger", "targeting"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                    activeTab === tab ? "bg-white text-foreground shadow-sm" : "text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "design" && (
              <div className="bg-card-bg rounded-xl border border-border p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={popupTitle}
                    onChange={(e) => setPopupTitle(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                  <textarea
                    value={popupSubtitle}
                    onChange={(e) => setPopupSubtitle(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Background</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                      <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-2 py-1.5 border border-border rounded-lg text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Accent</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                      <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 px-2 py-1.5 border border-border rounded-lg text-xs" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Show Image</span>
                  <button
                    onClick={() => setShowImage(!showImage)}
                    className={`w-11 h-6 rounded-full transition-colors ${showImage ? "bg-primary" : "bg-gray-300"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showImage ? "translate-x-5.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "trigger" && (
              <div className="bg-card-bg rounded-xl border border-border p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
                  {[
                    { id: "exit-intent", label: "Exit Intent", desc: "When user moves cursor to close tab" },
                    { id: "time-delay", label: "Time Delay", desc: "After X seconds on page" },
                    { id: "scroll", label: "Scroll Depth", desc: "When user scrolls X% of page" },
                    { id: "click", label: "On Click", desc: "When user clicks specific element" },
                    { id: "cart-abandon", label: "Cart Abandonment", desc: "When user has items in cart and tries to leave" },
                  ].map((trigger) => (
                    <button
                      key={trigger.id}
                      onClick={() => setTriggerType(trigger.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 mb-2 transition-all ${
                        triggerType === trigger.id ? "border-primary bg-primary/5" : "border-border hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-medium">{trigger.label}</p>
                      <p className="text-xs text-gray-500">{trigger.desc}</p>
                    </button>
                  ))}
                </div>
                {triggerType === "time-delay" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Delay (seconds)</label>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none"
                    />
                  </div>
                )}
                {triggerType === "scroll" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Scroll Percentage</label>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      defaultValue={50}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 text-center">50%</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "targeting" && (
              <div className="bg-card-bg rounded-xl border border-border p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Show to visitors with intent</label>
                  <div className="space-y-2">
                    {["Low Intent", "Medium Intent", "High Intent"].map((intent) => (
                      <label key={intent} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                        <span className="text-sm">{intent}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Show on pages</label>
                  <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none">
                    <option>All Pages</option>
                    <option>Homepage Only</option>
                    <option>Product Pages</option>
                    <option>Cart Page</option>
                    <option>Checkout Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none">
                    <option>Once per session</option>
                    <option>Once per day</option>
                    <option>Once per visitor</option>
                    <option>Every visit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device</label>
                  <div className="flex gap-2">
                    {["All Devices", "Desktop Only", "Mobile Only"].map((d) => (
                      <button key={d} className="flex-1 py-2 border border-border rounded-lg text-xs font-medium hover:border-primary transition-colors">
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                <Save className="w-4 h-4" /> Save
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-success text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors">
                <Play className="w-4 h-4" /> Publish
              </button>
            </div>
          </div>

          {/* Center + Right - Preview */}
          <div className="lg:col-span-2">
            <div className="bg-card-bg rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Preview</h3>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setDevice("desktop")}
                    className={`p-2 rounded-md transition-all ${device === "desktop" ? "bg-white shadow-sm" : ""}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDevice("mobile")}
                    className={`p-2 rounded-md transition-all ${device === "mobile" ? "bg-white shadow-sm" : ""}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              <div
                className={`mx-auto border border-border rounded-xl overflow-hidden relative transition-all ${
                  device === "mobile" ? "w-[375px]" : "w-full"
                }`}
                style={{ minHeight: 500 }}
              >
                {/* Fake Website Background */}
                <div className="bg-gray-50 p-6 min-h-[500px]">
                  {/* Fake nav */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-lg font-bold text-gray-800">Anveshan</div>
                    <div className="flex gap-4">
                      {["Home", "Shop", "About", "Cart"].map((n) => (
                        <span key={n} className="text-sm text-gray-500">{n}</span>
                      ))}
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl mb-4 flex items-center justify-center">
                    <p className="text-amber-800 font-semibold">Hero Banner</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        Product {i}
                      </div>
                    ))}
                  </div>

                  {/* Popup Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-fadeIn">
                    <div
                      className="w-[90%] max-w-md rounded-2xl shadow-2xl overflow-hidden relative"
                      style={{ background: bgColor }}
                    >
                      <button className="absolute top-3 right-3 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 z-10">
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                      {showImage && (
                        <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <div className="text-center text-white">
                            <p className="text-4xl mb-1">🌿</p>
                            <p className="text-sm font-medium opacity-80">Anveshan Special</p>
                          </div>
                        </div>
                      )}
                      <div className="p-6 text-center">
                        <h3 className="text-xl font-bold mb-2" style={{ color: "#0f172a" }}>
                          {popupTitle}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">{popupSubtitle}</p>
                        <input
                          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm mb-3"
                          placeholder="Enter your email"
                        />
                        <button
                          className="w-full py-3 text-white text-sm font-bold rounded-xl"
                          style={{ background: accentColor }}
                        >
                          {buttonText}
                        </button>
                        <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
