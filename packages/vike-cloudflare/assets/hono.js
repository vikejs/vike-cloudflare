import "virtual:@brillout/vite-plugin-server-entry:serverEntry";
import { Hono } from "vike-cloudflare/hono";
import app from "virtual:vike-cloudflare:user-entry";

const worker = new Hono();

worker.route("/", app);
worker.notFound(app.notFoundHandler);

export default worker;
