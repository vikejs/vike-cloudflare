import { createRouter } from "@hattip/router";
import { apply, serve } from "@photonjs/core/hattip";

function startServer() {
  console.log(`process.env.NODE_ENV === ${JSON.stringify(process.env.NODE_ENV)}`);
  const router = createRouter();
  apply(router);
  return serve(router, { port: 3000 });
}

export default startServer();
