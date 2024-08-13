/// <reference lib="webworker" />
import { renderPage } from "vike/server";

/**
 * @param url {string}
 * @returns {Promise<Response>}
 */
async function handleSsr(url) {
  const pageContextInit = {
    urlOriginal: url,
    fetch,
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
   * @param env {{}}
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    return handleSsr(request.url);
  },
};
