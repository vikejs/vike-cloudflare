import { createHandler } from "@universal-middleware/hono";
import { Hono } from "hono";
import { createTodoHandler } from "./server/create-todo-handler.js";
import { vikeHandler } from "./server/vike-handler";

const app = new Hono();

app.post("/api/todo/create", createHandler(() => createTodoHandler)());

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", createHandler(() => vikeHandler)());

export default app;
