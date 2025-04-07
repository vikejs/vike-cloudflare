import { apply } from "vike-server/hono";
import { serve } from "vike-server/hono/serve";
import { Hono } from "hono";

function startServer() {
  const app = new Hono();
  const port = process.env.PORT || 3000;

  apply(app);

  return serve(app, { port: +port });
}

export default startServer();
