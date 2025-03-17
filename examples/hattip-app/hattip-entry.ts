import { createRouter } from "@hattip/router";
import { apply } from "vike-cloudflare/hattip";
import { serve } from "vike-cloudflare/hattip/serve";

function startServer() {
  const router = createRouter();
  const port = process.env.PORT || 3000;

  apply(router);

  return serve(router, { port: +port });
}

export default startServer();
