import { Context } from "hono";

export const errorHandler = async (ctx: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (err) {
    console.error("Error occurred:", err);
    ctx.json({ error: "Internal Server Error" }, 500);
  }
};
