import { metric } from "@vercel/functions";

type MetricTags = Record<string, string>;

export function worldMetric(name: string, value: number, tags: MetricTags = {}) {
  metric(name, value, {
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    ...tags
  });
}

export function worldLog(event: string, fields: Record<string, unknown> = {}) {
  console.info(JSON.stringify({
    event,
    service: "worldpatro",
    version: "2.0.1",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
    ...fields
  }));
}
