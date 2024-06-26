import { copyFile, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePath, Plugin, ResolvedConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const WORKER_JS_NAME = "_worker.js";
const ROUTES_JSON_NAME = "_routes.json";

export interface VikeCloudflarePagesOptions {}

function getOutDir(config: ResolvedConfig, force?: "client" | "server" | "cloudflare"): string {
  const p = join(config.root, normalizePath(config.build.outDir));
  if (!force) return p;
  return join(dirname(p), force);
}

export const pages = (options?: VikeCloudflarePagesOptions): Plugin => {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "vike-cloudflare",
    enforce: "post",
    configResolved: async (config) => {
      resolvedConfig = config;
    },
    writeBundle: {
      order: "post",
      sequential: true,
      async handler() {
        if (!resolvedConfig.build?.ssr) {
          return;
        }
        const outCloudflare = getOutDir(resolvedConfig, "cloudflare");

        // 1. Ensure empty `dist/cloudflare` folder
        await rm(outCloudflare, { recursive: true, force: true });
        await mkdir(outCloudflare, { recursive: true });

        // 2. Symlink `dist/client/assets` to `dist/cloudflare/assets`
        await symlink(join("..", "client", "assets"), join(outCloudflare, "assets"));

        // 3. Symlink `dist/server` to `dist/cloudflare/server`
        await symlink(join("..", "server"), join(outCloudflare, "server"));

        // 4. Create _routes.json
        await writeFile(
          join(outCloudflare, ROUTES_JSON_NAME),
          JSON.stringify(
            {
              version: 1,
              include: ["/*"],
              // TODO: when using servers, can be extended
              exclude: ["/assets/*"],
            },
            undefined,
            2,
          ),
          "utf-8",
        );

        // 5. Create _worker.js
        await copyFile(join(__dirname, WORKER_JS_NAME), join(outCloudflare, WORKER_JS_NAME));
      },
    },
  };
};
