import { Context } from "hono";

export const errorHandler = async (c: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (err) {
    console.error("Error occurred:", err);
    c.json({ error: "Internal Server Error" }, 500);
  }
};
