import { createRouter } from "@hattip/router";
import { apply } from "vike-cloudflare/hattip";
import { serve } from "vike-cloudflare/hattip/serve";

function startServer() {
  const router = createRouter();
  apply(router);
  return serve(router, { port: 3000 });
}

export default startServer();
