import "virtual:@brillout/vite-plugin-server-entry:serverEntry";
import app from "virtual:vike-cloudflare:user-entry";
import { Hono } from "hono";

const worker = new Hono();

worker.route("/", app);
worker.notFound(app.notFoundHandler);

export default worker;
