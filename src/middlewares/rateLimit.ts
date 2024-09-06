import { Context } from "hono";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 100; // Max 100 requests per minute
const ipRequestsMap = new Map<string, { count: number; lastRequest: number }>();

export const rateLimit = async (c: Context, next: () => Promise<void>) => {
  const ip =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    c.req.header("remote-addr");

  if (!ip) {
    return c.json({ error: "Unable to identify IP address" }, 400);
  }

  const currentTime = Date.now();
  const requestInfo = ipRequestsMap.get(ip) || {
    count: 0,
    lastRequest: currentTime,
  };

  if (currentTime - requestInfo.lastRequest > RATE_LIMIT_WINDOW) {
    requestInfo.count = 1; // Reset the count for a new window
  } else {
    requestInfo.count += 1; // Increment the count in the same window
  }

  requestInfo.lastRequest = currentTime;
  ipRequestsMap.set(ip, requestInfo);

  if (requestInfo.count > MAX_REQUESTS) {
    return c.json({ error: "Too many requests. Please try again later." }, 429);
  }

  await next();
};
