"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  AppWindow,
  Code2,
  Palette,
  Megaphone,
  Bell,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Smartphone,
  Monitor,
  Copy,
  Check,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Create App",
    subtitle: "Start by creating a new application for your digital property.",
    icon: AppWindow,
    status: "Create app",
  },
  {
    id: 2,
    title: "SDK Installation",
    subtitle: "Install the Cooee SDK/Plugin to your Shopify store, website or app.",
    icon: Code2,
    status: "Share",
  },
  {
    id: 3,
    title: "App Branding",
    subtitle: "Setup your brand's fonts, colours, button shapes and logo.",
    icon: Palette,
    status: "Branding",
  },
  {
    id: 4,
    title: "Compose an Engagement",
    subtitle: "Compose your first engagement using templates or drag & drop.",
    icon: Megaphone,
    status: "Share",
  },
  {
    id: 5,
    title: "Push Integration",
    subtitle: "Connect with Firebase & Apple for push notifications.",
    icon: Bell,
    status: "Push setup",
  },
  {
    id: 6,
    title: "SDK Data Verification",
    subtitle: "Verify the SDK has been integrated properly.",
    icon: CheckCircle2,
    status: "CMS",
  },
];

function StepContent({ step, onComplete }: { step: number; onComplete: () => void }) {
  const [appName, setAppName] = useState("Anveshan");
  const [appType, setAppType] = useState("website");
  const [copied, setCopied] = useState(false);
  const [brandColor, setBrandColor] = useState("#6366f1");
  const [font, setFont] = useState("Inter");
  const [buttonStyle, setButtonStyle] = useState("rounded");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const sdkCode = `<!-- Cooee SDK for Anveshan -->
<script>
  (function(c,o,e){
    c.__cooee=c.__cooee||[];
    var s=o.createElement('script');
    s.async=true;
    s.src='https://sdk.cooee.co/v2/cooee.min.js';
    s.setAttribute('data-app-id','anveshan_${Date.now().toString(36)}');
    var f=o.getElementsByTagName('script')[0];
    f.parentNode.insertBefore(s,f);
  })(window,document);
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 2000);
  };

  switch (step) {
    case 1:
      return (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="Enter your app name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Platform</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "website", label: "Website", icon: Globe },
                { id: "android", label: "Android", icon: Smartphone },
                { id: "ios", label: "iOS", icon: Monitor },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setAppType(p.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    appType === p.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-gray-300 text-gray-500"
                  }`}
                >
                  <p.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
            <input
              type="url"
              className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              placeholder="https://anveshan.com"
              defaultValue="https://anveshan.com"
            />
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Create App
          </button>
        </div>
      );

    case 2:
      return (
        <div className="space-y-5 animate-fadeIn">
          <div className="bg-gray-900 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 font-mono">HTML — Paste before &lt;/head&gt;</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-green-400 text-xs font-mono overflow-x-auto leading-relaxed">{sdkCode}</pre>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Shopify?</strong> Go to Online Store → Themes → Edit Code → theme.liquid and paste the code before{" "}
              <code className="bg-blue-100 px-1 rounded">&lt;/head&gt;</code>
            </p>
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            I&apos;ve installed the SDK
          </button>
        </div>
      );

    case 3:
      return (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="w-12 h-12 rounded-lg border border-border cursor-pointer"
              />
              <input
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 px-4 py-3 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Inter</option>
              <option>Poppins</option>
              <option>Roboto</option>
              <option>Open Sans</option>
              <option>Montserrat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Button Style</label>
            <div className="grid grid-cols-3 gap-3">
              {["rounded", "pill", "square"].map((s) => (
                <button
                  key={s}
                  onClick={() => setButtonStyle(s)}
                  className={`p-3 border-2 transition-all ${
                    buttonStyle === s ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  style={{ borderRadius: s === "pill" ? 9999 : s === "rounded" ? 8 : 0 }}
                >
                  <span className="text-sm font-medium capitalize">{s}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <p className="text-sm text-gray-500">Drag & drop your logo or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG up to 2MB</p>
            </div>
          </div>
          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Preview</p>
            <div className="bg-white rounded-lg p-4 border border-border">
              <p className="text-sm font-semibold" style={{ color: brandColor, fontFamily: font }}>
                Anveshan — Premium Spices & Superfoods
              </p>
              <button
                className="mt-2 px-4 py-2 text-white text-sm font-medium"
                style={{
                  background: brandColor,
                  borderRadius: buttonStyle === "pill" ? 9999 : buttonStyle === "rounded" ? 8 : 0,
                }}
              >
                Shop Now
              </button>
            </div>
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Save Branding
          </button>
        </div>
      );

    case 4:
      return (
        <div className="space-y-5 animate-fadeIn">
          <p className="text-sm text-gray-600">Choose a template to get started:</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "Exit Intent Popup", desc: "Show offer when user tries to leave", color: "from-red-500 to-orange-500" },
              { name: "Welcome Banner", desc: "Greet visitors with a special offer", color: "from-blue-500 to-cyan-500" },
              { name: "Product Bundle", desc: "Frequently bought together upsell", color: "from-purple-500 to-pink-500" },
              { name: "Cart Upsell", desc: "Suggest add-ons at checkout", color: "from-green-500 to-emerald-500" },
              { name: "Social Proof", desc: "Show recent purchases notification", color: "from-amber-500 to-yellow-500" },
              { name: "Announcement Bar", desc: "Top bar with offers and news", color: "from-indigo-500 to-violet-500" },
            ].map((t) => (
              <div
                key={t.name}
                className="border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${t.color} mb-3 group-hover:scale-[1.02] transition-transform`} />
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Continue with Template
          </button>
        </div>
      );

    case 5:
      return (
        <div className="space-y-5 animate-fadeIn">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              Push notifications are optional for web-only setups. You can configure this later for mobile apps.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Firebase Server Key</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your Firebase server key (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apple Push Certificate</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <p className="text-sm text-gray-500">Upload .p8 or .p12 certificate</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={onComplete}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              Save & Continue
            </button>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-5 animate-fadeIn">
          {!verified ? (
            <>
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Verify SDK Integration</h3>
                <p className="text-sm text-gray-500 mt-1">Click below to check if the SDK is properly connected</p>
              </div>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {verifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Now"
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-success">SDK Verified Successfully!</h3>
              <p className="text-sm text-gray-500 mt-1">Everything looks good. You&apos;re all set!</p>
              <button
                onClick={onComplete}
                className="mt-6 w-full bg-success text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleComplete = () => {
    setCompletedSteps((prev) => [...prev, currentStep]);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex">
      {/* Left Panel */}
      <div className="w-[480px] bg-sidebar-bg p-8 flex flex-col min-h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Cooee</h1>
            <p className="text-sidebar-text text-xs opacity-70">for Anveshan</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Welcome, Meenakshi</h2>
          <p className="text-sidebar-text text-sm mt-1 opacity-80">Let&apos;s get you set up for success!</p>
        </div>

        {/* Steps */}
        <div className="flex-1 space-y-1">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            return (
              <button
                key={step.id}
                onClick={() => (isCompleted || isCurrent) && setCurrentStep(index)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all text-left ${
                  isCurrent
                    ? "bg-white/10"
                    : isCompleted
                    ? "opacity-70 hover:opacity-100"
                    : "opacity-40"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCompleted
                        ? "bg-success text-white"
                        : isCurrent
                        ? "bg-primary text-white animate-pulse-glow"
                        : "bg-white/10 text-sidebar-text"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 mt-1 ${
                        isCompleted ? "bg-success" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{step.title}</p>
                    {isCompleted && (
                      <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full font-medium">
                        done
                      </span>
                    )}
                  </div>
                  <p className="text-sidebar-text text-xs mt-0.5 opacity-70">{step.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-start justify-center p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{steps[currentStep].title}</h2>
          <p className="text-sm text-gray-500 mb-6">{steps[currentStep].subtitle}</p>

          <StepContent step={currentStep + 1} onComplete={handleComplete} />

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-foreground transition-colors disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => {
                if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
              }}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-2 text-sm text-primary font-medium hover:underline disabled:opacity-30"
            >
              Skip <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
