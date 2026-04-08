import { addEvent, upsertVisitor } from "@/lib/db";
import { getCustomerById, storeFingerprintInMetafield } from "@/lib/shopify";
import { headers } from "next/headers";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-App-Id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

async function getClientIP(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitorId, sessionId, event, data, page, visitor } = body;
    if (!visitorId || !event) {
      return Response.json({ error: "Missing visitorId or event" }, { status: 400, headers: CORS_HEADERS });
    }

    const clientIP = await getClientIP();

    if (visitor) {
      await upsertVisitor({
        id: visitorId,
        session_id: sessionId || "",
        fingerprint_id: visitor.fingerprintId || "",
        confidence: visitor.confidence ?? 0,
        is_returning: visitor.isReturning ?? false,
        visit_count: visitor.visitCount ?? 1,
        intent: visitor.intent || "low",
        intent_score: visitor.intentScore ?? 0,
        page_views: visitor.pageViews ?? 0,
        time_on_site: visitor.timeOnSite ?? 0,
        scroll_depth: visitor.scrollDepth ?? 0,
        click_count: visitor.clickCount ?? 0,
        cart_items: visitor.cartItems ?? 0,
        cart_value: visitor.cartValue ?? 0,
        source: visitor.source || "direct",
        device: visitor.device || "desktop",
        entry_page: visitor.entryPage || "/",
        current_page: visitor.currentPage || page || "/",
        pages: visitor.pages || [],
        email: visitor.email || null,
        phone: visitor.phone || null,
        ip: clientIP,
        is_suspicious: false,
        is_logged_in: visitor.isLoggedIn ?? false,
      });

      if (data?.shopifyCustomerId) {
        const shopifyId = data.shopifyCustomerId as string;
        const ordersCount = (data.ordersCount as number) || 0;
        const totalSpent = (data.totalSpent as number) || 0;
        let tier: "new" | "returning" | "loyal" | "vip" = "new";
        if (ordersCount >= 10 || totalSpent >= 5000) tier = "vip";
        else if (ordersCount >= 3) tier = "loyal";
        else if (ordersCount >= 1) tier = "returning";

        // Fetch real customer name from Shopify Admin API
        let customerName = "";
        let customerEmail = "";
        let customerPhone = "";
        const shopifyCustomer = await getCustomerById(shopifyId);
        if (shopifyCustomer) {
          customerName = shopifyCustomer.name;
          customerEmail = shopifyCustomer.email;
          customerPhone = shopifyCustomer.phone;

          // Store fingerprint in customer metafield for cross-device recognition
          const fpId = visitor?.fingerprintId;
          if (fpId) {
            storeFingerprintInMetafield(shopifyId, fpId).catch(() => {});
          }
        }

        await upsertVisitor({
          id: visitorId,
          shopify_customer_id: shopifyId,
          shopify_orders_count: ordersCount,
          shopify_total_spent: totalSpent,
          customer_tier: tier,
          is_logged_in: true,
          customer_name: customerName,
          email: customerEmail || visitor?.email || null,
          phone: customerPhone || visitor?.phone || null,
        });
      }
    }

    const record = await addEvent({
      visitorId,
      sessionId: sessionId || "",
      event,
      data: { ...(data || {}), _ip: clientIP },
      page: page || "/",
    });

    return Response.json({ ok: true, eventId: record.id }, { headers: CORS_HEADERS });
  } catch (e) {
    console.error("Event API error:", e);
    return Response.json({ error: "Server error" }, { status: 500, headers: CORS_HEADERS });
  }
}
