import { Hono } from "hono";
import { apply, serve } from "@photonjs/core/hono";

function startServer() {
  console.log(`process.env.NODE_ENV === ${JSON.stringify(process.env.NODE_ENV)}`);
  const app = new Hono();
  apply(app);
  return serve(app, { port: 3000 });
}

export default startServer();
