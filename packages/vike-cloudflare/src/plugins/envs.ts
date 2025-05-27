import type { Plugin } from "vite";
import { NAME } from "./const";
import { join } from "node:path";

export function envPlugin(): Plugin {
  return {
    name: `${NAME}:cloudflare-env`,
    apply: "build",
    config() {
      return {
        environments: {
          cloudflare: {
            consumer: "server",
            build: {
              ssr: true,
            },
          },
        },
      };
    },

    configEnvironment(name, config) {
      if (name === "cloudflare") {
        return {
          build: {
            outDir: config.build?.outDir ? join(config.build?.outDir, "..", "cloudflare") : "dist/cloudflare",
          },
        };
      }
    },
  };
}
