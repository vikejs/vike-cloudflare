export { config as default };

import { pages as plugin, type VikeCloudflarePagesOptions } from "./index";
import type { Config } from "vike/types";

const config = {
  name: "vike-cloudflare",
  require: {
    vike: ">=0.4.227",
  },
  vite: {
    plugins: [plugin()],
  },
  prerender: {
    enable: null,
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
