// In-memory store for Cooee analytics data
// In production this would be a real database (Postgres, Redis, etc.)

export interface VisitorRecord {
  id: string;
  sessionId: string;
  fingerprintId: string;
  confidence: number;       // FingerprintJS confidence score 0-1
  isReturning: boolean;     // true if seen this fingerprint before
  visitCount: number;       // total visits by this fingerprint
  firstSeen: number;
  lastSeen: number;
  intent: "low" | "medium" | "high";
  intentScore: number;
  pageViews: number;
  timeOnSite: number;
  scrollDepth: number;
  clickCount: number;
  cartItems: number;
  cartValue: number;
  source: string;
  device: string;
  entryPage: string;
  currentPage: string;
  pages: string[];
  country: string;
  engagementsShown: string[];
  converted: boolean;
  email?: string;
  phone?: string;
  // Shopify customer data (when logged in)
  shopifyCustomerId?: string;
  shopifyOrdersCount: number;
  shopifyTotalSpent: number;
  customerTier: "new" | "returning" | "loyal" | "vip";
  isLoggedIn: boolean;
  // IP data (server-side captured)
  ip: string;
  isSuspicious: boolean;
}

export interface EventRecord {
  id: string;
  visitorId: string;
  sessionId: string;
  event: string;
  data: Record<string, unknown>;
  page: string;
  timestamp: number;
}

export interface EngagementRecord {
  id: string;
  type: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: number;
  updatedAt: number;
  config: Record<string, unknown>;
}

// The actual in-memory stores
const visitors: Map<string, VisitorRecord> = new Map();
const events: EventRecord[] = [];
const engagements: Map<string, EngagementRecord> = new Map();

// Seed some default engagements
const defaultEngagements: EngagementRecord[] = [
  // ──────────────────────────────────────────────────
  // STRATEGY RULES:
  // - BAU already gives 15% at checkout
  // - Cooee adds max 2% extra FOMO → total max 17%
  // - NO new discount codes from popups
  // - Focus: urgency, trust, social proof, AOV bump
  // - Only for DIRECT traffic
  // ──────────────────────────────────────────────────

  // LOW intent: don't scare them, just build trust
  {
    id: "eng_welcome_bar",
    type: "Announcement Bar",
    name: "Free Shipping Reminder",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now() - 5 * 86400000,
    updatedAt: Date.now(),
    config: {
      text: "Free delivery on orders above ₹499 ✦ Farm-to-fork in 2-4 days ✦ FSSAI Certified",
      trigger: "page_load",
      targeting: { intent: ["all"], pages: ["all"], sources: ["direct"] },
    },
  },
  {
    id: "eng_social_proof",
    type: "Social Proof",
    name: "Recent Purchases Notification",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now() - 1 * 86400000,
    updatedAt: Date.now(),
    config: {
      trigger: "time_delay",
      delay: 8,
      targeting: { intent: ["low", "medium"], pages: ["/products/", "/collections/"], sources: ["direct"] },
    },
  },

  // MEDIUM intent: they're interested, capture WhatsApp for retargeting
  {
    id: "eng_spice_quiz",
    type: "Quiz",
    name: "Find Your Perfect Spice — Quiz",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    config: {
      trigger: "time_delay",
      targeting: { intent: ["medium"], pages: ["/products/", "/collections/", "/"], sources: ["direct"], customerTiers: ["new"] },
      questions: [
        { q: "What's your main health goal?", options: ["Immunity Boost", "Better Digestion", "Skin & Hair", "Daily Cooking"], emoji: "🎯" },
        { q: "How do you prefer your spices?", options: ["Raw / Whole", "Ground Powder", "Ready Mixes", "Not Sure Yet"], emoji: "🌿" },
        { q: "How often do you cook at home?", options: ["Daily", "3-4 times a week", "Weekends only", "Rarely"], emoji: "🍳" },
      ],
      results: {
        "Immunity Boost": { product: "Organic Lakadong Turmeric", reason: "7-12% curcumin — highest in India. One spoon in warm milk daily." },
        "Better Digestion": { product: "Cold Pressed Mustard Oil + Panchphoran", reason: "Traditional Bengali combo — improves gut health naturally." },
        "Skin & Hair": { product: "A2 Desi Ghee + Wild Forest Honey", reason: "Applied or consumed — both work. Farm-fresh, no preservatives." },
        "Daily Cooking": { product: "Spices Combo Pack", reason: "Everything you need — turmeric, mustard oil, ghee, honey. Save ₹200 on the combo." },
      },
    },
  },
  {
    id: "eng_bundle",
    type: "Product Bundle",
    name: "Turmeric + Honey Bundle",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now() - 3 * 86400000,
    updatedAt: Date.now(),
    config: {
      title: "Most customers buy these together",
      subtitle: "Turmeric + Raw Honey bundle — better absorption, better value. You save ₹100 on the combo.",
      buttonText: "View Bundle",
      trigger: "product_page",
      targeting: { intent: ["medium", "high"], pages: ["/products/"], sources: ["direct"] },
    },
  },

  // HIGH intent: they're about to buy, remove friction
  {
    id: "eng_cart_recovery",
    type: "Cart Popup",
    name: "Cart Nudge — Free Shipping",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now() - 2 * 86400000,
    updatedAt: Date.now(),
    config: {
      title: "You're ₹____ away from free delivery!",
      subtitle: "Add one more item to save ₹70 on shipping. Most customers add Raw Honey or Ghee.",
      buttonText: "Continue Shopping",
      trigger: "cart_idle",
      targeting: { intent: ["medium", "high"], pages: ["/cart"], sources: ["direct"] },
    },
  },
  {
    id: "eng_checkout_trust",
    type: "Trust Bar",
    name: "Checkout Trust Signals",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now() - 1 * 86400000,
    updatedAt: Date.now(),
    config: {
      text: "🔒 Secure Payment • 30-Day Easy Returns • FSSAI Certified • 1,00,000+ Orders Shipped",
      trigger: "checkout_page",
      targeting: { intent: ["all"], pages: ["/checkout"], sources: ["direct"] },
    },
  },

  // EXIT intent: don't offer more discount, create FOMO
  {
    id: "eng_exit_popup",
    type: "Exit Popup",
    name: "Exit — Stock FOMO",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now(),
    config: {
      title: "Your 15% discount is still active!",
      subtitle: "This batch of Lakadong Turmeric is selling fast. Your checkout discount is still active — don't miss it!",
      buttonText: "Complete My Order",
      trigger: "exit_intent",
      capture: "phone",
      targeting: { intent: ["medium", "high"], pages: ["all"], sources: ["direct"] },
    },
  },

  // RETURNING visitor: they came back, they're serious
  {
    id: "eng_returning_visitor",
    type: "Returning Visitor",
    name: "Welcome Back — Extra 2%",
    status: "active",
    impressions: 0,
    clicks: 0,
    conversions: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    config: {
      title: "Welcome back! We saved your cart",
      subtitle: "As a returning customer, you get an extra 2% off at checkout — that's 17% total. This offer expires today.",
      buttonText: "Shop Now — 17% Off",
      trigger: "page_load",
      capture: "phone",
      targeting: { intent: ["all"], pages: ["all"], returning: true, sources: ["direct"] },
    },
  },
];

defaultEngagements.forEach((e) => engagements.set(e.id, e));

// --- Store API ---

export function upsertVisitor(data: Partial<VisitorRecord> & { id: string }): VisitorRecord {
  const existing = visitors.get(data.id);
  const record: VisitorRecord = {
    id: data.id,
    sessionId: data.sessionId || existing?.sessionId || "",
    fingerprintId: data.fingerprintId || existing?.fingerprintId || "",
    confidence: data.confidence ?? existing?.confidence ?? 0,
    isReturning: data.isReturning ?? existing?.isReturning ?? false,
    visitCount: data.visitCount ?? existing?.visitCount ?? 1,
    firstSeen: existing?.firstSeen || Date.now(),
    lastSeen: Date.now(),
    intent: data.intent || existing?.intent || "low",
    intentScore: data.intentScore || existing?.intentScore || 0,
    pageViews: data.pageViews ?? existing?.pageViews ?? 0,
    timeOnSite: data.timeOnSite ?? existing?.timeOnSite ?? 0,
    scrollDepth: data.scrollDepth ?? existing?.scrollDepth ?? 0,
    clickCount: data.clickCount ?? existing?.clickCount ?? 0,
    cartItems: data.cartItems ?? existing?.cartItems ?? 0,
    cartValue: data.cartValue ?? existing?.cartValue ?? 0,
    source: data.source || existing?.source || "direct",
    device: data.device || existing?.device || "desktop",
    entryPage: data.entryPage || existing?.entryPage || "/",
    currentPage: data.currentPage || existing?.currentPage || "/",
    pages: data.pages || existing?.pages || [],
    country: data.country || existing?.country || "IN",
    engagementsShown: data.engagementsShown || existing?.engagementsShown || [],
    converted: data.converted ?? existing?.converted ?? false,
    email: data.email || existing?.email,
    phone: data.phone || existing?.phone,
    shopifyCustomerId: data.shopifyCustomerId || existing?.shopifyCustomerId,
    shopifyOrdersCount: data.shopifyOrdersCount ?? existing?.shopifyOrdersCount ?? 0,
    shopifyTotalSpent: data.shopifyTotalSpent ?? existing?.shopifyTotalSpent ?? 0,
    customerTier: data.customerTier || existing?.customerTier || "new",
    isLoggedIn: data.isLoggedIn ?? existing?.isLoggedIn ?? false,
    ip: data.ip || existing?.ip || "",
    isSuspicious: data.isSuspicious ?? existing?.isSuspicious ?? false,
  };
  visitors.set(data.id, record);
  return record;
}

export function getVisitor(id: string): VisitorRecord | undefined {
  return visitors.get(id);
}

export function getAllVisitors(): VisitorRecord[] {
  return Array.from(visitors.values());
}

export function getActiveVisitors(withinMs: number = 300000): VisitorRecord[] {
  const cutoff = Date.now() - withinMs;
  return Array.from(visitors.values()).filter((v) => v.lastSeen >= cutoff);
}

export function addEvent(event: Omit<EventRecord, "id" | "timestamp">): EventRecord {
  const record: EventRecord = {
    ...event,
    id: "evt_" + Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  };
  events.push(record);

  // Update engagement stats
  if (event.event === "engagement_shown") {
    const engId = event.data.engagementId as string;
    const eng = engagements.get(engId);
    if (eng) {
      eng.impressions++;
      eng.updatedAt = Date.now();
    }
  }
  if (event.event === "engagement_clicked") {
    const engId = event.data.engagementId as string;
    const eng = engagements.get(engId);
    if (eng) {
      eng.clicks++;
      eng.updatedAt = Date.now();
    }
  }
  if (event.event === "engagement_converted") {
    const engId = event.data.engagementId as string;
    const eng = engagements.get(engId);
    if (eng) {
      eng.conversions++;
      eng.updatedAt = Date.now();
    }
  }

  return record;
}

export function getEvents(limit: number = 100): EventRecord[] {
  return events.slice(-limit).reverse();
}

export function getEventsByVisitor(visitorId: string): EventRecord[] {
  return events.filter((e) => e.visitorId === visitorId);
}

export function getAllEngagements(): EngagementRecord[] {
  return Array.from(engagements.values());
}

export function getEngagement(id: string): EngagementRecord | undefined {
  return engagements.get(id);
}

export function getActiveEngagements(): EngagementRecord[] {
  return Array.from(engagements.values()).filter((e) => e.status === "active");
}

// --- Analytics aggregation ---

export function getAnalytics() {
  const allVisitors = getAllVisitors();
  const allEvents = events;
  const now = Date.now();
  const oneDayAgo = now - 86400000;
  const sevenDaysAgo = now - 7 * 86400000;

  const todayVisitors = allVisitors.filter((v) => v.firstSeen >= oneDayAgo);
  const weekVisitors = allVisitors.filter((v) => v.firstSeen >= sevenDaysAgo);

  // New vs Returning
  const newVisitors = allVisitors.filter((v) => !v.isReturning).length;
  const returningVisitors = allVisitors.filter((v) => v.isReturning).length;
  const avgConfidence = allVisitors.length > 0
    ? allVisitors.reduce((s, v) => s + v.confidence, 0) / allVisitors.length
    : 0;

  // Intent distribution
  const intentCounts = { low: 0, medium: 0, high: 0 };
  allVisitors.forEach((v) => intentCounts[v.intent]++);

  // Source distribution
  const sourceCounts: Record<string, number> = {};
  allVisitors.forEach((v) => {
    const src = v.source || "direct";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  // Page performance
  const pageCounts: Record<string, { views: number; totalTime: number; bounces: number; visitors: number }> = {};
  allVisitors.forEach((v) => {
    v.pages.forEach((p) => {
      if (!pageCounts[p]) pageCounts[p] = { views: 0, totalTime: 0, bounces: 0, visitors: 0 };
      pageCounts[p].views++;
      pageCounts[p].visitors++;
    });
    if (v.pageViews === 1) {
      const page = v.entryPage;
      if (pageCounts[page]) pageCounts[page].bounces++;
    }
  });

  // Conversion funnel
  const totalLanding = allVisitors.length;
  const viewedProduct = allVisitors.filter((v) => v.pages.some((p) => p.includes("/products/"))).length;
  const addedToCart = allVisitors.filter((v) => v.cartItems > 0).length;
  const reachedCheckout = allVisitors.filter((v) => v.pages.some((p) => p.includes("/checkout"))).length;
  const converted = allVisitors.filter((v) => v.converted).length;

  // Engagements summary
  const engs = getAllEngagements();
  const totalImpressions = engs.reduce((s, e) => s + e.impressions, 0);
  const totalClicks = engs.reduce((s, e) => s + e.clicks, 0);
  const totalConversions = engs.reduce((s, e) => s + e.conversions, 0);

  // Daily breakdown (last 7 days)
  const dailyData: { date: string; visitors: number; sessions: number; engaged: number; converted: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i + 1) * 86400000;
    const dayEnd = now - i * 86400000;
    const dayVisitors = allVisitors.filter((v) => v.firstSeen >= dayStart && v.firstSeen < dayEnd);
    const dayEvents = allEvents.filter((e) => e.timestamp >= dayStart && e.timestamp < dayEnd);
    const d = new Date(dayEnd);
    dailyData.push({
      date: d.toLocaleDateString("en-US", { weekday: "short" }),
      visitors: dayVisitors.length,
      sessions: dayVisitors.length, // 1 session per visitor for now
      engaged: dayVisitors.filter((v) => v.intentScore >= 30).length,
      converted: dayVisitors.filter((v) => v.converted).length,
    });
  }

  return {
    totalVisitors: allVisitors.length,
    newVisitors,
    returningVisitors,
    avgFingerprintConfidence: Math.round(avgConfidence * 100),
    todayVisitors: todayVisitors.length,
    weekVisitors: weekVisitors.length,
    activeNow: getActiveVisitors().length,
    totalPageViews: allVisitors.reduce((s, v) => s + v.pageViews, 0),
    avgSessionDuration: allVisitors.length > 0
      ? Math.round(allVisitors.reduce((s, v) => s + v.timeOnSite, 0) / allVisitors.length)
      : 0,
    conversionRate: allVisitors.length > 0
      ? ((converted / allVisitors.length) * 100).toFixed(1)
      : "0.0",
    intentDistribution: intentCounts,
    sourceDistribution: sourceCounts,
    funnel: {
      landing: totalLanding,
      productView: viewedProduct,
      addToCart: addedToCart,
      checkout: reachedCheckout,
      converted,
    },
    engagements: {
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCR: totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : "0.0",
    },
    dailyData,
    recentEvents: getEvents(20),
  };
}

// --- Decide which engagement to show ---

export function decideEngagement(visitor: VisitorRecord, page: string, trigger: string): EngagementRecord | null {
  const active = getActiveEngagements();

  // ── GUARD: Block discount offers for loyal/VIP customers ──
  // They already buy without discounts. Showing them offers = margin loss.
  // Only allow trust bar and social proof (non-discount engagements).
  const isKnownCustomer = visitor.isLoggedIn && visitor.shopifyOrdersCount > 0;
  const isLoyalOrVip = visitor.customerTier === "loyal" || visitor.customerTier === "vip";
  const nonDiscountTypes = ["Trust Bar", "Social Proof", "Announcement Bar"];

  for (const eng of active) {
    const config = eng.config as {
      trigger?: string;
      capture?: string;
      targeting?: {
        intent?: string[];
        pages?: string[];
        returning?: boolean;
        sources?: string[];
        customerTiers?: string[];  // e.g. ["new", "returning"] = only show to these tiers
      };
    };

    // Check trigger match
    if (config.trigger !== trigger) continue;

    // ── LOYALTY GUARD ──
    // If known customer with orders: only show non-discount engagements
    if (isKnownCustomer && !nonDiscountTypes.includes(eng.type)) continue;

    // If loyal/VIP: block everything except trust bar (they don't need convincing)
    if (isLoyalOrVip && eng.type !== "Trust Bar") continue;

    // If engagement specifies customer tiers, check it
    const targetTiers = config.targeting?.customerTiers;
    if (targetTiers && targetTiers.length > 0) {
      if (!targetTiers.includes(visitor.customerTier)) continue;
    }

    // Check source targeting
    const targetSources = config.targeting?.sources;
    if (targetSources && targetSources.length > 0) {
      const sourceMatch = targetSources.includes("all") || targetSources.includes(visitor.source);
      if (!sourceMatch) continue;
    }

    // Check page targeting
    const targetPages = config.targeting?.pages || ["all"];
    const pageMatch = targetPages.includes("all") || targetPages.some((tp) => page.includes(tp));
    if (!pageMatch) continue;

    // Check intent targeting
    const targetIntent = config.targeting?.intent || ["all"];
    const intentMatch = targetIntent.includes("all") || targetIntent.includes(visitor.intent);
    if (!intentMatch) continue;

    // Check returning visitor targeting
    if (config.targeting?.returning === true && !visitor.isReturning) continue;

    // Don't show same engagement twice in a session
    if (visitor.engagementsShown.includes(eng.id)) continue;

    return eng;
  }

  return null;
}
