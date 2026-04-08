import { getAllVisitors, getActiveVisitors, getVisitor } from "@/lib/db";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const filter = request.nextUrl.searchParams.get("filter");

  if (id) {
    const visitor = await getVisitor(id);
    if (!visitor) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(visitor);
  }

  if (filter === "active") {
    return Response.json(await getActiveVisitors());
  }

  return Response.json(await getAllVisitors());
}
