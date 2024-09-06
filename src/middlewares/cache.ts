import { Context } from "hono";

export const cacheMiddleware = async (
  ctx: Context,
  next: () => Promise<void>
) => {
  const cacheKey = new Request(ctx.req.url);
  const cache = await caches.open("unspsc-cache");
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    return (ctx.res = cachedResponse);
  }

  await next();

  const responseToCache = ctx.res.clone();
  cache.put(cacheKey, responseToCache);
};
