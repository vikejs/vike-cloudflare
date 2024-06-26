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
  } else {
    const { statusCode: status, headers } = httpResponse;
    const stream = httpResponse.getReadableWebStream();
    return new Response(stream, { headers, status });
  }
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
