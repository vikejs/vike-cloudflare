// import { createHandler } from "@universal-middleware/hono";
// import { createTodoHandler } from "./server/create-todo-handler.js";
import { Hono } from "hono";
import { apply } from "vike-cloudflare/hono";

// FIXME move to +middleware
// app.post('/api/todo/create', createHandler(() => createTodoHandler)())

function startServer() {
  const app = new Hono();
  const port = process.env.PORT || 3000;

  const { serve } = apply(app);

  console.log(process.env.VIKE_RUNTIME);

  return serve({ port: +port });
}

export default startServer();
