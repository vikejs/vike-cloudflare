export { config as default };

import { pages as plugin, type VikeCloudflarePagesOptions } from "./index";
import type { Config } from "vike/types";

const config = {
  name: "vike-cloudflare",
  require: {
    // TODO: set to latest Vike version
    // vike: '>=0.4.211',
  },
  vite: {
    plugins: [plugin()],
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
