"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { Copy, Check, CheckCircle2, Globe, Smartphone, Code2, Terminal, ExternalLink } from "lucide-react";

const platforms = [
  {
    id: "shopify",
    name: "Shopify",
    icon: "🛍️",
    instructions: [
      "Go to your Shopify Admin → Online Store → Themes",
      "Click Actions → Edit Code",
      "Open theme.liquid file",
      "Paste the SDK code before </head> tag",
      "Click Save",
    ],
    code: `<!-- Cooee SDK for Anveshan (Shopify) -->
<!-- Paste this before </head> in theme.liquid -->
<script
  src="https://YOUR_COOEE_DASHBOARD_URL/sdk/cooee.min.js"
  data-app-id="anveshan_app_live"
  data-api-base="https://YOUR_COOEE_DASHBOARD_URL"
  data-debug="true"
  async>
</script>

<!-- The SDK will automatically:
  ✅ Track all visitor behavior (scroll, clicks, time)
  ✅ Calculate buying intent score (low/medium/high)
  ✅ Detect Shopify cart adds via /cart.js
  ✅ Show smart popups, banners, social proof
  ✅ Detect exit intent (desktop + mobile)
  ✅ Send all data to your Cooee dashboard
-->`,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    icon: "🔧",
    instructions: [
      "Go to WordPress Admin → Appearance → Theme Editor",
      "Open header.php file",
      "Paste the SDK code before </head> tag",
      "Click Update File",
    ],
    code: `<!-- Cooee SDK for Anveshan (WooCommerce) -->
<!-- Paste this before </head> in header.php -->
<script
  src="https://YOUR_COOEE_DASHBOARD_URL/sdk/cooee.min.js"
  data-app-id="anveshan_app_live"
  data-api-base="https://YOUR_COOEE_DASHBOARD_URL"
  async>
</script>`,
  },
  {
    id: "custom",
    name: "Custom Website",
    icon: "🌐",
    instructions: [
      "Open your website's HTML file",
      "Paste the SDK code before </head> tag",
      "Deploy your changes",
    ],
    code: `<!-- Cooee SDK for Anveshan -->
<script
  src="https://YOUR_COOEE_DASHBOARD_URL/sdk/cooee.min.js"
  data-app-id="anveshan_app_live"
  data-api-base="https://YOUR_COOEE_DASHBOARD_URL"
  async>
</script>`,
  },
  {
    id: "android",
    name: "Android",
    icon: "🤖",
    instructions: [
      "Add the Cooee SDK dependency to your build.gradle",
      "Initialize the SDK in your Application class",
      "Add required permissions",
      "Build and run your app",
    ],
    code: `// build.gradle (app level)
dependencies {
    implementation 'co.cooee:android-sdk:2.4.0'
}

// Application.kt
class AnveshanApp : Application() {
    override fun onCreate() {
        super.onCreate()
        CooeeSDK.init(this, "anveshan_app_live")
    }
}

// AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />`,
  },
  {
    id: "ios",
    name: "iOS",
    icon: "🍎",
    instructions: [
      "Add CooeeSDK via CocoaPods or Swift Package Manager",
      "Initialize SDK in AppDelegate",
      "Build and run your app",
    ],
    code: `// Podfile
pod 'CooeeSDK', '~> 2.4.0'

// AppDelegate.swift
import CooeeSDK

func application(_ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    CooeeSDK.initialize(appId: "anveshan_app_live")
    return true
}`,
  },
];

export default function SDKPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("shopify");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const platform = platforms.find((p) => p.id === selectedPlatform)!;

  const handleCopy = () => {
    navigator.clipboard.writeText(platform.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Actually check if any visitors have been tracked
      const res = await fetch("/api/visitors");
      const visitors = await res.json();
      setVerified(visitors.length > 0);
      if (visitors.length === 0) {
        alert("No visitors detected yet. Make sure the SDK is installed and a page has been loaded.");
      }
    } catch {
      alert("Could not connect to API. Make sure the server is running.");
    }
    setVerifying(false);
  };

  return (
    <div>
      <Header title="SDK Setup" />
      <div className="p-6 space-y-6">
        {/* Platform Selector */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">Select Your Platform</h3>
          <div className="flex gap-3 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlatform(p.id);
                  setVerified(false);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedPlatform === p.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-sm font-medium">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructions */}
          <div className="bg-card-bg rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">
              Installation Steps — {platform.name}
            </h3>
            <ol className="space-y-3">
              {platform.instructions.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Code */}
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 font-mono">{platform.name} SDK Code</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-gray-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <pre className="p-4 text-green-400 text-xs font-mono overflow-x-auto leading-relaxed max-h-[300px] overflow-y-auto">
                {platform.code}
              </pre>
            </div>

            {/* App ID Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Your App ID:</strong>{" "}
                <code className="bg-blue-100 px-2 py-0.5 rounded font-mono text-xs">anveshan_app_live</code>
              </p>
              <p className="text-xs text-blue-600 mt-1">This is unique to your Anveshan account. Do not share publicly.</p>
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="bg-card-bg rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-2">Verify Installation</h3>
          <p className="text-sm text-gray-500 mb-4">
            After installing the SDK, click below to verify the connection.
          </p>
          {!verified ? (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {verifying ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying connection...
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4" /> Verify SDK Connection
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-xl animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <div>
                <p className="font-semibold text-success">SDK Connected Successfully!</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Data is being received from your {platform.name} installation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Integration Helpers */}
        <div className="bg-card-bg rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Available Integrations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Google Analytics", icon: "📊", connected: true },
              { name: "Klaviyo", icon: "📧", connected: true },
              { name: "Meta Pixel", icon: "📱", connected: false },
              { name: "WhatsApp", icon: "💬", connected: false },
              { name: "Microsoft Clarity", icon: "🔍", connected: false },
              { name: "Firebase", icon: "🔥", connected: false },
              { name: "Shopify", icon: "🛍️", connected: true },
              { name: "Slack", icon: "💼", connected: false },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer"
              >
                <span className="text-2xl">{integration.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{integration.name}</p>
                  <p className={`text-[11px] font-medium ${integration.connected ? "text-success" : "text-gray-400"}`}>
                    {integration.connected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
