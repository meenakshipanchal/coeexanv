import mysql from "mysql2/promise";

export const dynamic = "force-dynamic";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT) || 25060,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "cooee",
  ssl: { rejectUnauthorized: false },
  connectionLimit: 5,
});

export async function GET() {
  // All visitors
  const [visitorRows] = await pool.query("SELECT * FROM visitors ORDER BY last_seen DESC");
  const visitors = visitorRows as Record<string, unknown>[];

  const now = Date.now();
  const oneDayAgo = now - 86400000;

  const total = visitors.length;
  const today = visitors.filter((v) => Number(v.last_seen) >= oneDayAgo).length;
  const totalPageViews = visitors.reduce((s, v) => s + (Number(v.page_views) || 0), 0);
  const avgDuration = total > 0 ? Math.round(visitors.reduce((s, v) => s + (Number(v.time_on_site) || 0), 0) / total) : 0;
  const converted = visitors.filter((v) => v.converted).length;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";

  // Source distribution
  const sourceCounts: Record<string, number> = {};
  visitors.forEach((v) => {
    const src = (v.source as string) || "direct";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const sourceColors: Record<string, string> = {
    direct: "#6366f1", google_organic: "#22c55e", google_ads: "#34d399", meta_ads: "#3b82f6",
    instagram: "#ec4899", whatsapp: "#25D366", youtube: "#ef4444", twitter: "#1DA1F2",
  };
  const sourceData = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count,
      color: sourceColors[name] || "#94a3b8",
    }));

  // Funnel: Landing → PLP → PDP → Cart → Checkout → Purchase
  const landing = total;
  const plp = visitors.filter((v) => {
    const pages = typeof v.pages === "string" ? JSON.parse(v.pages as string) : (v.pages as string[]) || [];
    return pages.some((p: string) => p.includes("/collections"));
  }).length;
  const pdp = visitors.filter((v) => {
    const pages = typeof v.pages === "string" ? JSON.parse(v.pages as string) : (v.pages as string[]) || [];
    return pages.some((p: string) => p.includes("/products/"));
  }).length;
  const cart = visitors.filter((v) => Number(v.cart_items) > 0).length;
  const checkout = visitors.filter((v) => {
    const pages = typeof v.pages === "string" ? JSON.parse(v.pages as string) : (v.pages as string[]) || [];
    return pages.some((p: string) => p.includes("/checkout"));
  }).length;
  const purchased = converted;

  const funnelData = [
    { stage: "Landing", users: landing },
    { stage: "Collection (PLP)", users: plp },
    { stage: "Product (PDP)", users: pdp },
    { stage: "Add to Cart", users: cart },
    { stage: "Checkout", users: checkout },
    { stage: "Purchased", users: purchased },
  ].map((s, i, arr) => ({
    ...s,
    dropoff: i === 0 ? 0 : arr[i - 1].users > 0 ? Math.round(((arr[i - 1].users - s.users) / arr[i - 1].users) * 100) : 0,
  }));

  // Page performance (aggregate from all visitors' pages)
  const pageCounts: Record<string, { views: number; visitors: Set<string> }> = {};
  visitors.forEach((v) => {
    const pages = typeof v.pages === "string" ? JSON.parse(v.pages as string) : (v.pages as string[]) || [];
    pages.forEach((p: string) => {
      if (!pageCounts[p]) pageCounts[p] = { views: 0, visitors: new Set() };
      pageCounts[p].views++;
      pageCounts[p].visitors.add(v.id as string);
    });
  });
  const pagePerformance = Object.entries(pageCounts)
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 10)
    .map(([page, data]) => ({ page, views: data.views, uniqueVisitors: data.visitors.size }));

  // Intent distribution
  const intentCounts = { low: 0, medium: 0, high: 0 };
  visitors.forEach((v) => {
    const intent = v.intent as "low" | "medium" | "high";
    if (intentCounts[intent] !== undefined) intentCounts[intent]++;
  });

  // Device split
  const deviceCounts = { mobile: 0, desktop: 0 };
  visitors.forEach((v) => {
    const d = (v.device as string) || "desktop";
    if (d === "mobile") deviceCounts.mobile++;
    else deviceCounts.desktop++;
  });

  // New vs returning
  const newCount = visitors.filter((v) => !v.is_returning).length;
  const returningCount = visitors.filter((v) => v.is_returning).length;

  // Daily breakdown (last 7 days from events table)
  const sevenDaysAgo = now - 7 * 86400000;
  const [eventRows] = await pool.query(
    "SELECT DATE(FROM_UNIXTIME(timestamp/1000)) as day, COUNT(DISTINCT visitor_id) as visitors, COUNT(*) as events FROM events WHERE timestamp >= ? GROUP BY day ORDER BY day",
    [sevenDaysAgo]
  );
  const dailyData = (eventRows as { day: string; visitors: number; events: number }[]).map((r) => ({
    date: new Date(r.day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    visitors: r.visitors,
    events: r.events,
  }));

  // Cart analytics
  const cartVisitors = visitors.filter((v) => Number(v.cart_items) > 0);
  const avgCartValue = cartVisitors.length > 0
    ? Math.round(cartVisitors.reduce((s, v) => s + Number(v.cart_value), 0) / cartVisitors.length)
    : 0;
  const avgCartItems = cartVisitors.length > 0
    ? (cartVisitors.reduce((s, v) => s + Number(v.cart_items), 0) / cartVisitors.length).toFixed(1)
    : "0";

  // Sale events from events table
  const [saleRows] = await pool.query(
    "SELECT COUNT(*) as count, COALESCE(SUM(JSON_EXTRACT(data, '$.value')), 0) as revenue FROM events WHERE event IN ('purchase', 'conversion', 'checkout_completed')"
  );
  const sales = (saleRows as { count: number; revenue: number }[])[0];

  return Response.json({
    stats: {
      totalVisitors: total,
      todayVisitors: today,
      totalPageViews,
      avgSessionDuration: avgDuration,
      conversionRate,
      totalConverted: converted,
    },
    sourceData,
    funnelData,
    pagePerformance,
    intentDistribution: intentCounts,
    deviceSplit: deviceCounts,
    newVsReturning: { new: newCount, returning: returningCount },
    dailyData,
    cart: { avgValue: avgCartValue, avgItems: avgCartItems, totalCarts: cartVisitors.length },
    sales: { count: sales.count, revenue: Number(sales.revenue) || 0 },
  });
}
