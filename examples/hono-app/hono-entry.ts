import { Hono } from "hono";
import { apply } from "vike-cloudflare/hono";

function startServer() {
  const app = new Hono()
  const port = process.env.PORT || 3000

  const { serve } = apply(app)

  return serve({ port: +port })
}

export default startServer()
