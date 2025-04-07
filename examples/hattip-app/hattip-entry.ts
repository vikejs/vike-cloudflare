import { createRouter } from "@hattip/router";
import { apply } from "vike-server/hattip";
import { serve } from "vike-server/hattip/serve";

function startServer() {
  const router = createRouter();
  const port = process.env.PORT || 3000;

  apply(router);

  return serve(router, { port: +port });
}

export default startServer();
