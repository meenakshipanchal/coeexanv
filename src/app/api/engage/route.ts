import { decideEngagement, getAllEngagements, seedEngagements } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-App-Id",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const { visitorId, page, trigger } = await request.json();
    if (!visitorId) return Response.json({ engagement: null }, { headers: CORS_HEADERS });

    const engagement = await decideEngagement(visitorId, page || "/", trigger || "page_load");
    return Response.json({ engagement }, { headers: CORS_HEADERS });
  } catch {
    return Response.json({ engagement: null }, { headers: CORS_HEADERS });
  }
}

export async function GET() {
  await seedEngagements();
  return Response.json(await getAllEngagements());
}
