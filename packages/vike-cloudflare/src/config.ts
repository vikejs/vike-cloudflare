export { config as default };

import { pages as plugin } from "./plugins";
import type { Config } from "vike/types";

const config = {
  name: "vike-cloudflare",
  require: {
    vike: ">=0.4.227",
  },
  vite: {
    plugins: [
      ...(plugin() as
        // biome-ignore lint/suspicious/noExplicitAny: avoid type mismatch between different Vite versions
        any[]),
    ],
  },
  extends: ["import:vike-server/config"],
  prerender: {
    enable: null,
    disableAutoRun: true,
  },
  server: {
    entry: "virtual:vike-cloudflare:auto-entry",
    // We're using rollup's noExternal instead
    // @ts-ignore
    standalone: false,
  },
} satisfies Config;

declare global {
  namespace Vike {
    interface Config {
      server?: {
        entry: string;
      };
    }
    interface ConfigResolved {
      server?: {
        entry: string;
      }[];
    }
  }
}
