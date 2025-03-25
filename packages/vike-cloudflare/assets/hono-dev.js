import { apply, Hono } from "vike-cloudflare/hono";
import { serve } from "vike-cloudflare/hono/serve";

function startServer() {
  const app = new Hono();
  const port = process.env.PORT || 3000;

  apply(app);

  return serve(app, { port: +port });
}

export default startServer();
