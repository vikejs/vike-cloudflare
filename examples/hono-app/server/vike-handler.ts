import type { UniversalHandler } from "@universal-middleware/core";
import { renderPage } from "vike/server";

export const vikeHandler = (async (request, context, runtime): Promise<Response> => {
  const pageContextInit = { ...context, urlOriginal: request.url, headersOriginal: request.headers, ...runtime };
  const pageContext = await renderPage(pageContextInit);
  const response = pageContext.httpResponse;

  const { readable, writable } = new TransformStream();

  response?.pipe(writable);

  return new Response(readable, {
    status: response?.statusCode,
    headers: response?.headers,
  });
}) satisfies UniversalHandler;
