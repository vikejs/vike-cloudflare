import type { HattipHandler } from "@hattip/core";
import { createRouter } from "@hattip/router";
import { createHandler } from "@universal-middleware/hattip";
import { createTodoHandler } from "./server/create-todo-handler";
import { vikeHandler } from "./server/vike-handler";

const router = createRouter();

router.post("/api/todo/create", createHandler(() => createTodoHandler)());

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
router.use(createHandler(() => vikeHandler)());

export default router.buildHandler() as HattipHandler;
