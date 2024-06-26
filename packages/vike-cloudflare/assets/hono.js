import { Hono } from "hono";
import app from "virtual:vike-cloudflare-entry";

const worker = new Hono();

worker.route("/", app);
worker.notFound(app.notFoundHandler);

export default worker;
