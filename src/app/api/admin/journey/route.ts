import { getVisitorJourney, getAllVisitors } from "@/lib/db";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const visitorId = request.nextUrl.searchParams.get("id");

  if (visitorId) {
    const journey = await getVisitorJourney(visitorId);
    return Response.json(journey);
  }

  // Return all visitors for the list view
  const visitors = await getAllVisitors();
  return Response.json(visitors);
}
