import mysql from "mysql2/promise";

// Connection pool to DigitalOcean MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 25060,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "cooee",
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ─── Types ───

export interface VisitorRow {
  id: string;
  fingerprint_id: string;
  confidence: number;
  session_id: string;
  is_returning: boolean;
  visit_count: number;
  first_seen: number;
  last_seen: number;
  intent: "low" | "medium" | "high";
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
  is_suspicious: boolean;
  is_logged_in: boolean;
  shopify_customer_id: string | null;
  shopify_orders_count: number;
  shopify_total_spent: number;
  customer_tier: "new" | "returning" | "loyal" | "vip";
  engagements_shown: string[];
  converted: boolean;
}

export interface EventRow {
  id: string;
  visitor_id: string;
  session_id: string;
  event: string;
  data: Record<string, unknown>;
  page: string;
  ip: string;
  timestamp: number;
}

// ─── Visitors ───

export async function upsertVisitor(data: Partial<VisitorRow> & { id: string }) {
  const now = Date.now();
  await pool.query(
    `INSERT INTO visitors (
      id, fingerprint_id, confidence, session_id,
      is_returning, visit_count, first_seen, last_seen,
      intent, intent_score, page_views, time_on_site,
      scroll_depth, click_count, cart_items, cart_value,
      source, device, entry_page, current_page, pages,
      email, phone, ip, is_suspicious, is_logged_in,
      shopify_customer_id, shopify_orders_count, shopify_total_spent,
      customer_tier, engagements_shown, converted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      fingerprint_id = COALESCE(VALUES(fingerprint_id), fingerprint_id),
      confidence = IF(VALUES(confidence) > 0, VALUES(confidence), confidence),
      session_id = COALESCE(VALUES(session_id), session_id),
      is_returning = VALUES(is_returning) OR is_returning,
      visit_count = GREATEST(VALUES(visit_count), visit_count),
      last_seen = VALUES(last_seen),
      intent = VALUES(intent),
      intent_score = VALUES(intent_score),
      page_views = GREATEST(VALUES(page_views), page_views),
      time_on_site = GREATEST(VALUES(time_on_site), time_on_site),
      scroll_depth = GREATEST(VALUES(scroll_depth), scroll_depth),
      click_count = GREATEST(VALUES(click_count), click_count),
      cart_items = VALUES(cart_items),
      cart_value = VALUES(cart_value),
      source = COALESCE(VALUES(source), source),
      device = COALESCE(VALUES(device), device),
      current_page = COALESCE(VALUES(current_page), current_page),
      pages = VALUES(pages),
      email = COALESCE(VALUES(email), email),
      phone = COALESCE(VALUES(phone), phone),
      ip = COALESCE(VALUES(ip), ip),
      is_suspicious = VALUES(is_suspicious) OR is_suspicious,
      is_logged_in = VALUES(is_logged_in) OR is_logged_in,
      shopify_customer_id = COALESCE(VALUES(shopify_customer_id), shopify_customer_id),
      shopify_orders_count = GREATEST(VALUES(shopify_orders_count), shopify_orders_count),
      shopify_total_spent = GREATEST(VALUES(shopify_total_spent), shopify_total_spent),
      customer_tier = VALUES(customer_tier),
      engagements_shown = VALUES(engagements_shown),
      converted = VALUES(converted) OR converted`,
    [
      data.id,
      data.fingerprint_id || "",
      data.confidence ?? 0,
      data.session_id || "",
      data.is_returning ?? false,
      data.visit_count ?? 1,
      now,
      now,
      data.intent || "low",
      data.intent_score ?? 0,
      data.page_views ?? 0,
      data.time_on_site ?? 0,
      data.scroll_depth ?? 0,
      data.click_count ?? 0,
      data.cart_items ?? 0,
      data.cart_value ?? 0,
      data.source || "direct",
      data.device || "desktop",
      data.entry_page || "/",
      data.current_page || "/",
      JSON.stringify(data.pages || []),
      data.email || null,
      data.phone || null,
      data.ip || "",
      data.is_suspicious ?? false,
      data.is_logged_in ?? false,
      data.shopify_customer_id || null,
      data.shopify_orders_count ?? 0,
      data.shopify_total_spent ?? 0,
      data.customer_tier || "new",
      JSON.stringify(data.engagements_shown || []),
      data.converted ?? false,
    ]
  );
}

export async function getVisitor(id: string): Promise<VisitorRow | null> {
  const [rows] = await pool.query("SELECT * FROM visitors WHERE id = ?", [id]);
  const arr = rows as VisitorRow[];
  if (arr.length === 0) return null;
  const row = arr[0];
  row.pages = typeof row.pages === "string" ? JSON.parse(row.pages) : row.pages || [];
  row.engagements_shown = typeof row.engagements_shown === "string" ? JSON.parse(row.engagements_shown) : row.engagements_shown || [];
  return row;
}

export async function getAllVisitors(): Promise<VisitorRow[]> {
  const [rows] = await pool.query("SELECT * FROM visitors ORDER BY last_seen DESC LIMIT 500");
  return (rows as VisitorRow[]).map((r) => {
    r.pages = typeof r.pages === "string" ? JSON.parse(r.pages) : r.pages || [];
    r.engagements_shown = typeof r.engagements_shown === "string" ? JSON.parse(r.engagements_shown) : r.engagements_shown || [];
    return r;
  });
}

export async function getActiveVisitors(withinMs: number = 300000): Promise<VisitorRow[]> {
  const cutoff = Date.now() - withinMs;
  const [rows] = await pool.query("SELECT * FROM visitors WHERE last_seen >= ? ORDER BY last_seen DESC", [cutoff]);
  return (rows as VisitorRow[]).map((r) => {
    r.pages = typeof r.pages === "string" ? JSON.parse(r.pages) : r.pages || [];
    r.engagements_shown = typeof r.engagements_shown === "string" ? JSON.parse(r.engagements_shown) : r.engagements_shown || [];
    return r;
  });
}

// ─── Events ───

export async function addEvent(data: { visitorId: string; sessionId: string; event: string; data: Record<string, unknown>; page: string }) {
  const id = "evt_" + Math.random().toString(36).substr(2, 9);
  const now = Date.now();
  const ip = (data.data?._ip as string) || "";
  await pool.query(
    "INSERT INTO events (id, visitor_id, session_id, event, data, page, ip, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, data.visitorId, data.sessionId, data.event, JSON.stringify(data.data), data.page, ip, now]
  );

  // Update engagement stats
  if (data.event === "engagement_shown" || data.event === "engagement_clicked" || data.event === "engagement_converted") {
    const engId = data.data?.engagementId as string;
    if (engId) {
      const col = data.event === "engagement_shown" ? "impressions" : data.event === "engagement_clicked" ? "clicks" : "conversions";
      await pool.query(`UPDATE engagements SET ${col} = ${col} + 1 WHERE id = ?`, [engId]);
    }
  }

  // Save contact data
  if (data.event === "contact_captured") {
    await pool.query(
      `INSERT INTO contacts (visitor_id, fingerprint_id, phone, email, wa_consent, consent_timestamp, capture_method, quiz_answers, recommendation, intent, source, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.visitorId,
        (data.data?.fingerprintId as string) || "",
        (data.data?.phone as string) || null,
        (data.data?.email as string) || null,
        data.data?.waConsent ?? false,
        (data.data?.consentTimestamp as string) || null,
        (data.data?.captureMethod as string) || "popup",
        JSON.stringify(data.data?.quizAnswers || []),
        (data.data?.recommendation as string) || null,
        (data.data?.intent as string) || "low",
        (data.data?.source as string) || "direct",
        ip,
      ]
    );
  }

  return { id, timestamp: now };
}

export async function getEvents(limit: number = 100): Promise<EventRow[]> {
  const [rows] = await pool.query("SELECT * FROM events ORDER BY timestamp DESC LIMIT ?", [limit]);
  return (rows as EventRow[]).map((r) => {
    r.data = typeof r.data === "string" ? JSON.parse(r.data) : r.data || {};
    return r;
  });
}

export async function getEventsByVisitor(visitorId: string): Promise<EventRow[]> {
  const [rows] = await pool.query("SELECT * FROM events WHERE visitor_id = ? ORDER BY timestamp ASC", [visitorId]);
  return (rows as EventRow[]).map((r) => {
    r.data = typeof r.data === "string" ? JSON.parse(r.data) : r.data || {};
    return r;
  });
}

// ─── Engagements ───

export async function getAllEngagements() {
  const [rows] = await pool.query("SELECT * FROM engagements ORDER BY created_at DESC");
  return (rows as Record<string, unknown>[]).map((r) => {
    r.config = typeof r.config === "string" ? JSON.parse(r.config as string) : r.config || {};
    return r;
  });
}

export async function getActiveEngagements() {
  const [rows] = await pool.query("SELECT * FROM engagements WHERE status = 'active'");
  return (rows as Record<string, unknown>[]).map((r) => {
    r.config = typeof r.config === "string" ? JSON.parse(r.config as string) : r.config || {};
    return r;
  });
}

// ─── Decide engagement (same logic, now reads from MySQL visitor) ───

export async function decideEngagement(visitorId: string, page: string, trigger: string) {
  const visitor = await getVisitor(visitorId);
  if (!visitor) return null;

  const active = await getActiveEngagements();
  const isKnownCustomer = visitor.is_logged_in && visitor.shopify_orders_count > 0;
  const isLoyalOrVip = visitor.customer_tier === "loyal" || visitor.customer_tier === "vip";
  const nonDiscountTypes = ["Trust Bar", "Social Proof", "Announcement Bar"];

  for (const eng of active) {
    const config = eng.config as Record<string, unknown>;
    const targeting = config.targeting as Record<string, unknown> | undefined;

    if (config.trigger !== trigger) continue;
    if (isKnownCustomer && !nonDiscountTypes.includes(eng.type as string)) continue;
    if (isLoyalOrVip && eng.type !== "Trust Bar") continue;

    const targetTiers = targeting?.customerTiers as string[] | undefined;
    if (targetTiers && targetTiers.length > 0 && !targetTiers.includes(visitor.customer_tier)) continue;

    const targetSources = targeting?.sources as string[] | undefined;
    if (targetSources && targetSources.length > 0 && !targetSources.includes("all") && !targetSources.includes(visitor.source)) continue;

    const targetPages = (targeting?.pages as string[]) || ["all"];
    if (!targetPages.includes("all") && !targetPages.some((tp) => page.includes(tp))) continue;

    const targetIntent = (targeting?.intent as string[]) || ["all"];
    if (!targetIntent.includes("all") && !targetIntent.includes(visitor.intent)) continue;

    if (targeting?.returning === true && !visitor.is_returning) continue;

    if (visitor.engagements_shown.includes(eng.id as string)) continue;

    // Mark as shown
    visitor.engagements_shown.push(eng.id as string);
    await pool.query("UPDATE visitors SET engagements_shown = ? WHERE id = ?", [
      JSON.stringify(visitor.engagements_shown),
      visitorId,
    ]);

    return { id: eng.id, type: eng.type, name: eng.name, config: eng.config };
  }

  return null;
}

// ─── Analytics ───

export async function getAnalytics() {
  const [visitorRows] = await pool.query("SELECT * FROM visitors");
  const allVisitors = visitorRows as VisitorRow[];

  const now = Date.now();
  const oneDayAgo = now - 86400000;

  const totalVisitors = allVisitors.length;
  const todayVisitors = allVisitors.filter((v) => Number(v.first_seen) >= oneDayAgo).length;
  const activeNow = allVisitors.filter((v) => Number(v.last_seen) >= now - 300000).length;
  const newVisitors = allVisitors.filter((v) => !v.is_returning).length;
  const returningVisitors = allVisitors.filter((v) => v.is_returning).length;
  const converted = allVisitors.filter((v) => v.converted).length;

  const intentCounts = { low: 0, medium: 0, high: 0 };
  const sourceCounts: Record<string, number> = {};
  allVisitors.forEach((v) => {
    intentCounts[v.intent]++;
    const src = v.source || "direct";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const [engRows] = await pool.query("SELECT * FROM engagements");
  const engs = engRows as { impressions: number; clicks: number; conversions: number }[];
  const totalImpressions = engs.reduce((s, e) => s + e.impressions, 0);
  const totalClicks = engs.reduce((s, e) => s + e.clicks, 0);
  const totalConversions = engs.reduce((s, e) => s + e.conversions, 0);

  const [recentRows] = await pool.query("SELECT * FROM events ORDER BY timestamp DESC LIMIT 20");
  const recentEvents = (recentRows as EventRow[]).map((r) => {
    r.data = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
    return r;
  });

  return {
    totalVisitors,
    newVisitors,
    returningVisitors,
    todayVisitors,
    activeNow,
    totalPageViews: allVisitors.reduce((s, v) => s + v.page_views, 0),
    avgSessionDuration: totalVisitors > 0 ? Math.round(allVisitors.reduce((s, v) => s + v.time_on_site, 0) / totalVisitors) : 0,
    conversionRate: totalVisitors > 0 ? ((converted / totalVisitors) * 100).toFixed(1) : "0.0",
    intentDistribution: intentCounts,
    sourceDistribution: sourceCounts,
    engagements: {
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCR: totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : "0.0",
    },
    recentEvents,
    dailyData: [],
  };
}

// ─── Admin: Get visitor journey ───

export async function getVisitorJourney(visitorId: string) {
  const visitor = await getVisitor(visitorId);
  const events = await getEventsByVisitor(visitorId);
  return { visitor, events };
}

// ─── Admin: Get all contacts ───

export async function getContacts(limit: number = 100) {
  const [rows] = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows;
}

// ─── Seed engagements (run once) ───

export async function seedEngagements() {
  const [existing] = await pool.query("SELECT COUNT(*) as count FROM engagements");
  if ((existing as { count: number }[])[0].count > 0) return;

  const engs = [
    { id: "eng_welcome_bar", type: "Announcement Bar", name: "Free Shipping Reminder", config: { text: "Free delivery on orders above ₹499 ✦ Farm-to-fork in 2-4 days ✦ FSSAI Certified", trigger: "page_load", targeting: { intent: ["all"], pages: ["all"], sources: ["direct"] } } },
    { id: "eng_social_proof", type: "Social Proof", name: "Recent Purchases Notification", config: { trigger: "time_delay", delay: 8, targeting: { intent: ["low", "medium"], pages: ["/products/", "/collections/"], sources: ["direct"] } } },
    { id: "eng_spice_quiz", type: "Quiz", name: "Find Your Perfect Spice — Quiz", config: { trigger: "time_delay", targeting: { intent: ["medium"], pages: ["/products/", "/collections/", "/"], sources: ["direct"], customerTiers: ["new"] }, questions: [{ q: "What's your main health goal?", options: ["Immunity Boost", "Better Digestion", "Skin & Hair", "Daily Cooking"], emoji: "🎯" }, { q: "How do you prefer your spices?", options: ["Raw / Whole", "Ground Powder", "Ready Mixes", "Not Sure Yet"], emoji: "🌿" }, { q: "How often do you cook at home?", options: ["Daily", "3-4 times a week", "Weekends only", "Rarely"], emoji: "🍳" }], results: { "Immunity Boost": { product: "Organic Lakadong Turmeric", reason: "7-12% curcumin — highest in India." }, "Better Digestion": { product: "Cold Pressed Mustard Oil + Panchphoran", reason: "Traditional combo for gut health." }, "Skin & Hair": { product: "A2 Desi Ghee + Wild Forest Honey", reason: "Farm-fresh, no preservatives." }, "Daily Cooking": { product: "Spices Combo Pack", reason: "Everything you need — save ₹200." } } } },
    { id: "eng_bundle", type: "Product Bundle", name: "Turmeric + Honey Bundle", config: { title: "Most customers buy these together", subtitle: "Turmeric + Raw Honey — better absorption, save ₹100.", buttonText: "View Bundle", trigger: "product_page", targeting: { intent: ["medium", "high"], pages: ["/products/"], sources: ["direct"] } } },
    { id: "eng_cart_recovery", type: "Cart Popup", name: "Cart Nudge — Free Shipping", config: { title: "You're close to free delivery!", subtitle: "Add one more item to save ₹70 on shipping.", buttonText: "Continue Shopping", trigger: "cart_idle", targeting: { intent: ["medium", "high"], pages: ["/cart"], sources: ["direct"] } } },
    { id: "eng_checkout_trust", type: "Trust Bar", name: "Checkout Trust Signals", config: { text: "🔒 Secure Payment • 30-Day Easy Returns • FSSAI Certified • 1,00,000+ Orders Shipped", trigger: "checkout_page", targeting: { intent: ["all"], pages: ["/checkout"], sources: ["direct"] } } },
    { id: "eng_exit_popup", type: "Exit Popup", name: "Exit — Stock FOMO", config: { title: "Your 15% discount is still active!", subtitle: "Lakadong Turmeric is selling fast. Your checkout discount is still active — don't miss it!", buttonText: "Complete My Order", trigger: "exit_intent", capture: "phone", targeting: { intent: ["medium", "high"], pages: ["all"], sources: ["direct"] } } },
    { id: "eng_returning_visitor", type: "Returning Visitor", name: "Welcome Back — Extra 2%", config: { title: "Welcome back! We saved your cart", subtitle: "As a returning customer, you get an extra 2% off — that's 17% total. Expires today.", buttonText: "Shop Now — 17% Off", trigger: "page_load", capture: "phone", targeting: { intent: ["all"], pages: ["all"], returning: true, sources: ["direct"] } } },
  ];

  for (const eng of engs) {
    await pool.query(
      "INSERT INTO engagements (id, type, name, status, config) VALUES (?, ?, ?, 'active', ?)",
      [eng.id, eng.type, eng.name, JSON.stringify(eng.config)]
    );
  }
  console.log("✅ Seeded", engs.length, "engagements");
}
