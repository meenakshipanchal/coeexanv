import { getAnalytics, seedEngagements } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await seedEngagements(); // Seed once if empty
  return Response.json(await getAnalytics());
}
