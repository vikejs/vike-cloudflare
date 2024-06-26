import { createTodoHandler } from "./server/create-todo-handler";
import { vikeHandler } from "./server/vike-handler";
import type { HattipHandler } from "@hattip/core";
import { createRouter, type RouteHandler } from "@hattip/router";

interface Middleware<
  Context extends Record<string | number | symbol, unknown>,
> {
  (
    request: Request,
    context: Context,
  ): Response | void | Promise<Response> | Promise<void>;
}

function handlerAdapter<
  Context extends Record<string | number | symbol, unknown>,
>(handler: Middleware<Context>): RouteHandler<unknown, unknown> {
  return (context) => {
    const rawContext = context as unknown as Record<string, unknown>;
    rawContext.context ??= {};
    return handler(context.request, rawContext.context as Context);
  };
}

const router = createRouter();

router.post("/api/todo/create", handlerAdapter(createTodoHandler));

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
router.use(handlerAdapter(vikeHandler));

export default router.buildHandler() as HattipHandler;
