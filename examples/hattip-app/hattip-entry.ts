import { createRouter } from "@hattip/router";
import { apply, serve } from "@photonjs/core/hattip";

function startServer() {
  const router = createRouter();
  const port = process.env.PORT || 3000;

  apply(router);

  return serve(router, { port: +port });
}

export default startServer();
