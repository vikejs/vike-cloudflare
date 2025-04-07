export { config as default };

import { pages as plugin } from "./plugins";
import type { Config } from "vike/types";
import { vikeServer } from "vike-server/plugin";

const config = {
  name: "vike-cloudflare",
  require: {
    vike: ">=0.4.227",
  },
  vite: {
    // biome-ignore lint/suspicious/noExplicitAny: avoid type mismatch between different Vite versions
    plugins: [...plugin(), vikeServer()] as any[],
  },
  prerender: {
    enable: null,
    disableAutoRun: true,
    keepDistServer: true,
  },
  meta: {
    server: {
      env: { config: true },
      global: true,
    },
  },
  vite6BuilderApp: true,
} satisfies Config;

declare global {
  namespace Vike {
    interface Config {
      server?:
        | string
        | {
            entry: string;
          };
    }
  }
}
