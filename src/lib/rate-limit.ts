// lib/rate-limit.ts
import { NextRequest } from "next/server";
import { LRUCache } from "lru-cache";

const rateLimitCache = new LRUCache<string, number[]>({
  max: 1000,
  ttl: 15 * 60 * 1000,
});

type RateLimitRequest = Pick<NextRequest, "headers"> | NextRequest;

export function rateLimit(config: { max: number; windowMs: number }) {
  return {
    check(request: RateLimitRequest) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown";
      const key = `rate-limit:${ip}`;

      let requestTimestamps = rateLimitCache.get(key) || [];
      const now = Date.now();

      console.log("IP Address: " + ip);
      console.log("Request Timestamps: ", requestTimestamps);

      requestTimestamps = requestTimestamps.filter(
        (timestamp) => now - timestamp < config.windowMs
      );

      requestTimestamps.push(now);
      rateLimitCache.set(key, requestTimestamps);

      return {
        success: requestTimestamps.length <= config.max,
        limit: config.max,
        remaining: Math.max(0, config.max - requestTimestamps.length),
      };
    },
  };
}
