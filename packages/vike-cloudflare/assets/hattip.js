import "virtual:@brillout/vite-plugin-server-entry:serverEntry";
import cloudflareWorkersAdapter from "@hattip/adapter-cloudflare-workers/no-static";
import handler from "virtual:vike-cloudflare:user-entry";

export default {
  fetch: cloudflareWorkersAdapter(handler),
};
