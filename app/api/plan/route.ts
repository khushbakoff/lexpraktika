import { resolvePlan } from "@/lib/server/plan";

export async function GET() {
  const { plan } = await resolvePlan();
  return Response.json({ plan }, { headers: { "Cache-Control": "no-store" } });
}
