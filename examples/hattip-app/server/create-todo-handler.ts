export async function createTodoHandler<Context extends Record<string | number | symbol, unknown>>(
  request: Request,
  _context?: Context,
): Promise<Response> {
  await request.json();

  return new Response(JSON.stringify({ status: "OK" }), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}
