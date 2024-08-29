import type { UniversalHandler } from "@universal-middleware/core";

export const createTodoHandler = (async (request: Request): Promise<Response> => {
  await request.json();

  return new Response(JSON.stringify({ status: "OK" }), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}) satisfies UniversalHandler;
