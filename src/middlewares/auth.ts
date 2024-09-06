import { Context } from "hono";

const VALID_API_KEYS = ["your-secure-api-key-1", "your-secure-api-key-2"]; // TODO: Replace with actual API keys

export const apiKeyAuth = async (c: Context, next: () => Promise<void>) => {
  const apiKey = c.req.header("x-unspsc-lookup-key"); // Assuming the API key is passed in the 'x-unspsc-lookup-key' header

  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    return c.json({ error: "Unauthorized: Invalid API key" }, 401);
  }

  await next();
};
