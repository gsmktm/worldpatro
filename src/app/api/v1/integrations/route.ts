import { NextResponse } from "next/server";
import { publicIntegrationCatalog } from "@/lib/integrations/catalog";

export const dynamic = "force-dynamic";

export function GET() {
  const integrations = publicIntegrationCatalog();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    policy: {
      catalogIsDiscoveryOnly: true,
      authorityBeatsAggregator: true,
      secretsAreServerOnly: true,
      paidOrRestrictedProvidersAreOptIn: true
    },
    summary: {
      total: integrations.length,
      runtimeEnabled: integrations.filter(item => item.runtimeEnabled).length,
      configured: integrations.filter(item => item.configured).length
    },
    integrations
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
