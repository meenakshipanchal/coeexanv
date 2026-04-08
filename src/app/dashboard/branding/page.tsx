"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { Check, Upload, Eye } from "lucide-react";

export default function BrandingPage() {
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#22c55e");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#0f172a");
  const [font, setFont] = useState("Inter");
  const [buttonStyle, setButtonStyle] = useState("rounded");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Header title="App Branding" />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings */}
          <div className="space-y-6">
            <div className="bg-card-bg rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Brand Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Primary", value: primaryColor, onChange: setPrimaryColor },
                  { label: "Secondary", value: secondaryColor, onChange: setSecondaryColor },
                  { label: "Background", value: bgColor, onChange: setBgColor },
                  { label: "Text", value: textColor, onChange: setTextColor },
                ].map((c) => (
                  <div key={c.label}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{c.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.value}
                        onChange={(e) => c.onChange(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={c.value}
                        onChange={(e) => c.onChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card-bg rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Typography</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {["Inter", "Poppins", "Roboto", "Open Sans", "Montserrat", "Lato", "Nunito"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-card-bg rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Button Style</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "rounded", label: "Rounded", radius: "8px" },
                  { id: "pill", label: "Pill", radius: "9999px" },
                  { id: "square", label: "Square", radius: "0px" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setButtonStyle(s.id)}
                    className={`p-4 border-2 transition-all ${
                      buttonStyle === s.id ? "border-primary bg-primary/5" : "border-border hover:border-gray-300"
                    }`}
                    style={{ borderRadius: s.radius }}
                  >
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card-bg rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Logo</h3>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG — Max 2MB</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                "Save Branding"
              )}
            </button>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-card-bg rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Live Preview</h3>
                <Eye className="w-4 h-4 text-gray-400" />
              </div>

              {/* Popup Preview */}
              <div className="rounded-xl border border-border overflow-hidden" style={{ background: bgColor }}>
                {/* Announcement Bar */}
                <div className="py-2.5 px-4 text-center text-sm font-medium text-white" style={{ background: primaryColor, fontFamily: font }}>
                  Free shipping on orders above ₹499! Use code: ANVESHAN10
                </div>

                {/* Page Content Mock */}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2" style={{ color: textColor, fontFamily: font }}>
                    Anveshan — Farm to Fork
                  </h2>
                  <p className="text-sm mb-4" style={{ color: textColor, opacity: 0.7, fontFamily: font }}>
                    Premium spices, superfoods & cold-pressed oils sourced directly from Indian farmers.
                  </p>
                  <button
                    className="px-6 py-2.5 text-white text-sm font-semibold"
                    style={{
                      background: primaryColor,
                      borderRadius: buttonStyle === "pill" ? 9999 : buttonStyle === "rounded" ? 8 : 0,
                      fontFamily: font,
                    }}
                  >
                    Shop Now
                  </button>
                </div>

                {/* Popup Preview */}
                <div className="mx-6 mb-6 rounded-xl border border-border overflow-hidden shadow-lg">
                  <div className="p-5 text-center" style={{ background: bgColor }}>
                    <p className="text-lg font-bold mb-1" style={{ color: textColor, fontFamily: font }}>
                      Get 15% Off!
                    </p>
                    <p className="text-xs mb-3" style={{ color: textColor, opacity: 0.6, fontFamily: font }}>
                      Subscribe to our newsletter for exclusive deals
                    </p>
                    <input
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3"
                      placeholder="Enter your email"
                      style={{ fontFamily: font }}
                    />
                    <button
                      className="w-full py-2.5 text-white text-sm font-semibold"
                      style={{
                        background: secondaryColor,
                        borderRadius: buttonStyle === "pill" ? 9999 : buttonStyle === "rounded" ? 8 : 0,
                        fontFamily: font,
                      }}
                    >
                      Subscribe & Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="mt-4 rounded-xl border border-border p-4" style={{ background: bgColor }}>
                <p className="text-xs text-gray-500 mb-2 font-medium">Social Proof Widget</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-lg" style={{ background: primaryColor, opacity: 0.2 }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: textColor, fontFamily: font }}>
                      Rahul from Mumbai
                    </p>
                    <p className="text-xs" style={{ color: textColor, opacity: 0.5, fontFamily: font }}>
                      purchased Lakadong Turmeric — 3 min ago
                    </p>
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
