export { config as default };

import { pages as plugin } from "./plugins";
import type { VikeCloudflarePagesOptions } from "./types";
import type { Config } from "vike/types";
import server from "vike-server/plugin";

const config = {
  name: "vike-cloudflare",
  require: {
    vike: ">=0.4.224",
  },
  vite: {
    plugins: [
      ...plugin(),
      server({
        entry: "virtual:vike-cloudflare:auto-entry",
        // We're using rollup's noExternal instead
        standalone: false,
        runtime: "workerd",
      }),
    ],
  },
  prerender: {
    value: null,
    disableAutoRun: true,
  },
  meta: {
    server: { env: { config: true }, global: true },
  },
} satisfies Config;

declare global {
  namespace Vike {
    interface Config {
      server?: VikeCloudflarePagesOptions["server"];
    }
  }
}
