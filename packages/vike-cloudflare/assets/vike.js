/// <reference lib="webworker" />
import "virtual:@brillout/vite-plugin-server-entry:serverEntry";
import { renderPage } from "vike/server";

/**
 * @param url {string}
 * @param ctx {{ env: any, ctx: any }}
 * @returns {Promise<Response>}
 */
async function handleSsr(url, ctx) {
  const pageContextInit = {
    urlOriginal: url,
    fetch,
    ...ctx,
  };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return new Response("Something went wrong", { status: 500 });
  }
  const { statusCode: status, headers } = httpResponse;

  const { readable, writable } = new TransformStream();

  httpResponse.pipe(writable);

  return new Response(readable, {
    status,
    headers,
  });
}

export default {
  /**
   * @param request {Request}
   * @param env {any}
   * @param ctx {any}
   * @returns {Promise<Response>}
   */
  async fetch(request, env, ctx) {
    return handleSsr(request.url, { env, ctx });
  },
};
