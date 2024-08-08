import { cp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { normalizePath, Plugin, ResolvedConfig } from "vite";
import hattipAsset from "../assets/hattip.js?raw";
import honoAsset from "../assets/hono.js?raw";
import vikeAsset from "../assets/vike.js?raw";

const NAME = "vike-cloudflare";
const WORKER_JS_NAME = "_worker.js";
const WORKER_NAME = "cloudflare-worker";
const ROUTES_JSON_NAME = "_routes.json";
const isWin = process.platform === "win32";
const isCI = Boolean(process.env.CI);

export type SupportedServers = "hono" | "hattip";

export interface VikeCloudflarePagesOptions {
  server?: {
    kind: SupportedServers;
    entry: string;
  };
}

function getAsset(kind: SupportedServers | undefined) {
  switch (kind) {
    case "hono": {
      return honoAsset;
    }
    case "hattip": {
      return hattipAsset;
    }
    default:
      return vikeAsset;
  }
}

export const pages = (options?: VikeCloudflarePagesOptions): Plugin => {
  const virtualEntryId = "virtual:vike-cloudflare-entry";
  const virtualServerId = "virtual:vike-cloudflare-server";
  const resolvedVirtualServerId = "\0" + virtualServerId;
  let resolvedConfig: ResolvedConfig;

  return {
    name: NAME,
    enforce: "post",
    resolveId(id) {
      if (id === virtualEntryId) {
        assert(options?.server, `[${NAME}] server.entry is required when using a server`);
        return options.server.entry;
      }
      if (id === virtualServerId) {
        return resolvedVirtualServerId;
      }
    },
    load(id) {
      if (id === resolvedVirtualServerId) {
        return getAsset(options?.server?.kind);
      }
    },
    config(userConfig) {
      if (!userConfig.build?.target) {
        userConfig.build ??= {};
        userConfig.build.target = 'es2022';   
      }
    },
    configResolved: async (config) => {
      resolvedConfig = config;
    },
    options(inputOptions) {
      if (!resolvedConfig.build?.ssr) {
        return;
      }
      assert(
        typeof inputOptions.input === "object" && !Array.isArray(inputOptions.input),
        `[${NAME}] input should be an object. Aborting`,
      );

      inputOptions.input[WORKER_NAME] = virtualServerId;

      if (options?.server?.entry) {
        inputOptions.input["cloudflare-server-entry"] = virtualEntryId;
      }
    },
    writeBundle: {
      order: "post",
      sequential: true,
      async handler(_, bundle) {
        if (!resolvedConfig.build?.ssr) {
          return;
        }
        const outCloudflare = getOutDir(resolvedConfig, "cloudflare");

        // 1. Ensure empty `dist/cloudflare` folder
        await rm(outCloudflare, { recursive: true, force: true });
        await mkdir(outCloudflare, { recursive: true });

        // 2. Symlink `dist/client/assets` to `dist/cloudflare/assets`
        await symlinkOrCopy(join("..", "client", "assets"), join(outCloudflare, "assets"));

        // 3. Symlink `dist/server` to `dist/cloudflare/server`
        await symlinkOrCopy(join("..", "server"), join(outCloudflare, "server"));

        // 4. Create _routes.json
        await writeFile(
          join(outCloudflare, ROUTES_JSON_NAME),
          JSON.stringify(
            {
              version: 1,
              include: ["/*"],
              exclude: ["/assets/*"],
            },
            undefined,
            2,
          ),
          "utf-8",
        );

        // 5. Create _worker.js
        const [chunkPath] = Object.entries(bundle).find(([_, value]) => {
          return value.type === "chunk" && value.isEntry && value.name === WORKER_NAME;
        })!;

        await writeFile(
          join(outCloudflare, WORKER_JS_NAME),
          `import handler from "./server/${chunkPath}";
export default handler;
`,
          "utf-8",
        );
      },
    },
  };
};

async function symlinkOrCopy(target: string, path: string) {
  if (isWin || isCI) {
    await cp(resolve(path, "..", target), path, {
      dereference: true,
      force: true,
      recursive: true,
    });
  } else {
    await symlink(target, path);
  }
}

function getOutDir(config: ResolvedConfig, force?: "client" | "server" | "cloudflare"): string {
  const p = join(config.root, normalizePath(config.build.outDir));
  if (!force) return p;
  return join(dirname(p), force);
}

function assert(condition: unknown, message: string): asserts condition {
  if (condition) {
    return;
  }
  throw new Error(message);
}
