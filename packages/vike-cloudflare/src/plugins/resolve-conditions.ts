import type { Plugin } from "vite";
import { NAME } from "./const";

// https://github.com/cloudflare/workers-sdk/blob/4d9d9e6c830b32a0e9948ace32e20a1cdac3a53b/packages/vite-plugin-cloudflare/src/cloudflare-environment.ts#L114C1-L119C3
const cloudflareBuiltInModules = [
  "cloudflare:email",
  "cloudflare:sockets",
  "cloudflare:workers",
  "cloudflare:workflows",
];

export function resolveConditionsPlugin(): Plugin {
  return {
    name: `${NAME}:resolve-conditions`,
    config(_config, env) {
      const isDev = env.command === "serve";
      return {
        ssr: {
          ...(isDev ? {} : { noExternal: true }),
          resolve: {
            // https://github.com/cloudflare/workers-sdk/blob/515de6ab40ed6154a2e6579ff90b14b304809609/packages/wrangler/src/deployment-bundle/bundle.ts#L37
            conditions: ["workerd", "worker", "browser", "development|production"],
            builtins: [...cloudflareBuiltInModules],
          },
        },
      };
    },
  };
}
