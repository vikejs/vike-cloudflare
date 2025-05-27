import { Hono } from "hono";
import { apply, serve } from "@photonjs/core/hono";

function startServer() {
  const app = new Hono();
  const port = process.env.PORT || 3000;

  apply(app);

  return serve(app, { port: +port });
}

export default startServer();
