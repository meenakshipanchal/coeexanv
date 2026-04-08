"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// This simulates the Anveshan website with the SDK installed
// Visit /demo to see the SDK in action and generate real data for the dashboard

export default function DemoPage() {
  const [page, setPage] = useState("/");
  const [cartItems, setCartItems] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  useEffect(() => {
    // Override console.log to capture Cooee debug output
    const origLog = console.log;
    console.log = function (...args: unknown[]) {
      origLog.apply(console, args);
      const msg = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
      if (msg.includes("[Cooee]")) {
        setDebugLog((prev) => [...prev.slice(-30), msg]);
      }
    };
    return () => { console.log = origLog; };
  }, []);

  const navigateTo = (newPage: string) => {
    setPage(newPage);
    history.pushState({}, "", `/demo?page=${encodeURIComponent(newPage)}`);
  };

  const addToCart = (product: string, price: number) => {
    const newItems = cartItems + 1;
    const newValue = cartValue + price;
    setCartItems(newItems);
    setCartValue(newValue);
    if (typeof window !== "undefined" && window.Cooee) {
      window.Cooee.setCartData(newItems, newValue);
    }
  };

  return (
    <>
      <Script
        src="/sdk/cooee.min.js"
        data-app-id="anveshan_app_live"
        data-api-base=""
        data-debug="true"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Simulated Anveshan Header */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-lg text-gray-800">Anveshan</span>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">DEMO</span>
            </div>
            <nav className="flex gap-6 text-sm">
              <button onClick={() => navigateTo("/")} className={`hover:text-indigo-600 ${page === "/" ? "text-indigo-600 font-medium" : "text-gray-600"}`}>Home</button>
              <button onClick={() => navigateTo("/collections/spices")} className={`hover:text-indigo-600 ${page.includes("collections") ? "text-indigo-600 font-medium" : "text-gray-600"}`}>Spices</button>
              <button onClick={() => navigateTo("/products/turmeric")} className={`hover:text-indigo-600 ${page.includes("turmeric") ? "text-indigo-600 font-medium" : "text-gray-600"}`}>Turmeric</button>
              <button onClick={() => navigateTo("/cart")} className={`hover:text-indigo-600 relative ${page === "/cart" ? "text-indigo-600 font-medium" : "text-gray-600"}`}>
                Cart
                {cartItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartItems}</span>
                )}
              </button>
              <button onClick={() => navigateTo("/checkout")} className={`hover:text-indigo-600 ${page === "/checkout" ? "text-indigo-600 font-medium" : "text-gray-600"}`}>Checkout</button>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {page === "/" && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-gray-800">Farm-to-Fork Superfoods</h1>
                <p className="text-gray-600 mt-2">Pure, traceable ingredients sourced directly from Indian farms</p>
                <button onClick={() => navigateTo("/collections/spices")} className="mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  Shop Spices →
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: "Organic Turmeric", price: 449, img: "🟡" },
                  { name: "Raw Forest Honey", price: 599, img: "🍯" },
                  { name: "A2 Desi Ghee", price: 899, img: "🧈" },
                ].map((p) => (
                  <div key={p.name} className="bg-white rounded-xl p-4 border shadow-sm">
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-5xl">{p.img}</div>
                    <h3 className="font-semibold mt-3">{p.name}</h3>
                    <p className="text-indigo-600 font-bold">₹{p.price}</p>
                    <button onClick={() => addToCart(p.name, p.price)} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700">Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "/collections/spices" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Spice Collection</h1>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: "Organic Turmeric Powder", price: 449, img: "🟡" },
                  { name: "Panchphoran Masala", price: 349, img: "🌶️" },
                  { name: "Cold Pressed Mustard Oil", price: 399, img: "🫒" },
                  { name: "Black Pepper", price: 299, img: "⚫" },
                  { name: "Cinnamon Sticks", price: 249, img: "🪵" },
                  { name: "Spices Combo Pack", price: 999, img: "📦" },
                ].map((p) => (
                  <div key={p.name} className="bg-white rounded-xl p-4 border shadow-sm">
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-5xl">{p.img}</div>
                    <h3 className="font-semibold mt-3">{p.name}</h3>
                    <p className="text-indigo-600 font-bold">₹{p.price}</p>
                    <button onClick={() => addToCart(p.name, p.price)} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700">Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {page === "/products/turmeric" && (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl flex items-center justify-center text-8xl h-96">🟡</div>
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">Organic Turmeric Powder</h1>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-sm text-gray-500">(142 reviews)</span>
                </div>
                <p className="text-3xl font-bold text-indigo-600">₹449</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sourced directly from Lakadong, Meghalaya — known for the highest curcumin content in the world (7-12%).
                  Our turmeric is single-origin, lab-tested, and traceable to the farm.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  ✅ FSSAI Certified &nbsp; ✅ No Additives &nbsp; ✅ Lab Tested
                </div>
                <button onClick={() => addToCart("Organic Turmeric", 449)} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
                  Add to Cart — ₹449
                </button>
                <p className="text-xs text-gray-400 text-center">Free shipping on orders above ₹499</p>
              </div>
            </div>
          )}

          {page === "/cart" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold">Your Cart</h1>
              {cartItems > 0 ? (
                <>
                  <div className="bg-white rounded-xl border p-4">
                    <p className="font-medium">{cartItems} item(s) — ₹{cartValue}</p>
                  </div>
                  <button onClick={() => navigateTo("/checkout")} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
                    Proceed to Checkout
                  </button>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-5xl mb-4">🛒</p>
                  <p>Your cart is empty</p>
                  <button onClick={() => navigateTo("/collections/spices")} className="mt-4 text-indigo-600 font-medium text-sm">Shop Spices →</button>
                </div>
              )}
            </div>
          )}

          {page === "/checkout" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h1 className="text-2xl font-bold">Checkout</h1>
              <div className="bg-white rounded-xl border p-6 space-y-4">
                <input placeholder="Full Name" className="w-full border rounded-lg p-3 text-sm" />
                <input placeholder="Email" className="w-full border rounded-lg p-3 text-sm" />
                <input placeholder="Phone" className="w-full border rounded-lg p-3 text-sm" />
                <input placeholder="Address" className="w-full border rounded-lg p-3 text-sm" />
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p>Order Total: <strong>₹{cartValue}</strong></p>
                </div>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && window.Cooee) {
                      window.Cooee.trackConversion({ value: cartValue, items: cartItems });
                    }
                    alert("Order placed! (demo)");
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Place Order — ₹{cartValue}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* SDK Debug Console */}
        <div className="fixed bottom-0 right-0 w-96 max-h-64 bg-gray-900 text-green-400 text-[11px] font-mono p-3 rounded-tl-lg overflow-y-auto z-[100000] border-t border-l border-gray-700">
          <div className="flex items-center justify-between mb-2 text-gray-400 text-[10px]">
            <span>🔧 Cooee SDK Debug Console</span>
            <button onClick={() => setDebugLog([])} className="hover:text-white">Clear</button>
          </div>
          {debugLog.length === 0 ? (
            <p className="text-gray-500">Waiting for SDK events...</p>
          ) : (
            debugLog.map((log, i) => (
              <div key={i} className="py-0.5 border-b border-gray-800 last:border-0">{log}</div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// Extend Window interface for Cooee
declare global {
  interface Window {
    Cooee?: {
      init: (appId: string, options?: { apiBase?: string; debug?: boolean }) => void;
      showPopup: (options: Record<string, unknown>) => void;
      showAnnouncementBar: (options: Record<string, unknown>) => void;
      showSocialProof: (options: Record<string, unknown>) => void;
      onExitIntent: (callback: () => void) => void;
      getVisitor: () => Record<string, unknown>;
      getIntent: () => { level: string; score: number };
      setCartData: (items: number, value: number) => void;
      trackEvent: (event: string, data?: Record<string, unknown>) => void;
      setEmail: (email: string) => void;
      trackConversion: (data?: Record<string, unknown>) => void;
      debug: (enabled?: boolean) => void;
    };
  }
}
