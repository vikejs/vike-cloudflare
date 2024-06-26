import { Hono, type Context } from "hono";
import { env } from "hono/adapter";
import { createMiddleware } from "hono/factory";
import { createTodoHandler } from "./server/create-todo-handler.js";
import { vikeHandler } from "./server/vike-handler";

const envs = env<{ NODE_ENV: string; PORT: string }>({
  env: {},
} as unknown as Context<object>);
const isProduction = envs.NODE_ENV === "production";

interface Middleware<Context extends Record<string | number | symbol, unknown>> {
  (request: Request, context: Context): Response | void | Promise<Response> | Promise<void>;
}

export function handlerAdapter<Context extends Record<string | number | symbol, unknown>>(
  handler: Middleware<Context>,
) {
  return createMiddleware(async (context, next) => {
    let ctx = context.get("context");
    if (!ctx) {
      ctx = {};
      context.set("context", ctx);
    }

    const res = await handler(context.req.raw, ctx as Context);
    context.set("context", ctx);

    if (!res) {
      await next();
    }

    return res;
  });
}

const app = new Hono();

// app.use(compress());

// if (isProduction) {
//   app.use(
//     "/*",
//     serveStatic({
//       root: `dist/client/`,
//     }),
//   );
// }

app.post("/api/todo/create", handlerAdapter(createTodoHandler));

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", handlerAdapter(vikeHandler));

// if (isProduction) {
//   const port = envs.PORT ? parseInt(envs.PORT, 10) : 3000;
//
//   console.log(`Server listening on http://localhost:${port}`);
//   serve({
//     fetch: app.fetch,
//     port: port,
//   });
// }

export default app;
