import cloudflareWorkersAdapter from "@hattip/adapter-cloudflare-workers/no-static";
import handler from "virtual:vike-cloudflare-entry";

export default {
  fetch: cloudflareWorkersAdapter(handler),
};
