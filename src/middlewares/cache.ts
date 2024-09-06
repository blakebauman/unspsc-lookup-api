import { Context } from "hono";

export const cacheMiddleware = async (
  c: Context,
  next: () => Promise<void>
) => {
  const cacheKey = new Request(c.req.url);
  const cache = await caches.open("unspsc-cache");
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    return (c.res = cachedResponse);
  }

  await next();

  const responseToCache = c.res.clone();
  cache.put(cacheKey, responseToCache);
};
