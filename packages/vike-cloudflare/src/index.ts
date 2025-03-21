import { cp, mkdir, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { builtinModules } from "node:module";
import { dirname, isAbsolute, join, posix, relative } from "node:path";
import { prerender } from "vike/api";
import { normalizePath, type Plugin, type ResolvedConfig } from "vite";
import hattipAsset from "../assets/hattip.js?raw";
import honoAsset from "../assets/hono.js?raw";
import vikeAsset from "../assets/vike.js?raw";
import { getVikeConfig } from "vike/plugin";

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

// biome-ignore lint/suspicious/noExplicitAny:
export const pages = (): any => {
  const virtualEntryId = "virtual:vike-cloudflare-entry";
  const virtualServerId = "virtual:vike-cloudflare-server";
  const resolvedVirtualServerId = `\0${virtualServerId}`;
  let resolvedConfig: ResolvedConfig;
  let shouldPrerender = false;
  let options: VikeCloudflarePagesOptions;

  return [
    {
      name: NAME,
      enforce: "post",
      apply(config) {
        return Boolean(config.build?.ssr);
      },
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
          userConfig.build.target = "es2022";
        }

        // Vite bundles/inlines workspace packages by default.
        // It needs to bundle the right exports.
        return {
          ssr: {
            target: "webworker",
          },
          build: {
            rollupOptions: {
              external: [...builtinModules, /^node:/],
            },
          },
          resolve: {
            // https://github.com/cloudflare/workers-sdk/blob/515de6ab40ed6154a2e6579ff90b14b304809609/packages/wrangler/src/deployment-bundle/bundle.ts#L37
            conditions: ["workerd", "worker", "browser", "module", "import", "require", "development|production"],
          },
        };
      },
      configResolved: async (config) => {
        resolvedConfig = config;
        const vike = getVikeConfig(config);
        assert2(vike);
        options = { server: vike.config.server };
        shouldPrerender = isPrerenderEnabled(vike);
      },
      options(inputOptions) {
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
        async handler(opts, bundle) {
          const outCloudflare = getOutDir(resolvedConfig, "cloudflare");
          const outClient = getOutDir(resolvedConfig, "client");
          const outServer = getOutDir(resolvedConfig, "server");

          // 1. Ensure empty `dist/cloudflare` folder
          await rm(outCloudflare, { recursive: true, force: true });
          await mkdir(outCloudflare, { recursive: true });

          let staticRoutes: string[] = [];

          // 2. Symlink `dist/client/*` to `dist/cloudflare/*`
          for (const file of await readdir(outClient, {
            withFileTypes: true,
          })) {
            if (file.isDirectory()) {
              staticRoutes.push(`/${file.name}/*`);
            } else {
              staticRoutes.push(`/${file.name}`);
            }
            await symlinkOrCopy(join(outClient, file.name), join(outCloudflare, file.name));
          }

          // 3. Symlink `dist/server` to `dist/cloudflare/server`
          await symlinkOrCopy(outServer, join(outCloudflare, "server"));

          if (shouldPrerender) {
            // 4. Prerender
            const filePaths = await prerenderPages();
            const relPaths = filePaths.map((path) => relative(outClient, path));
            for (const relPath of relPaths) {
              await symlinkOrCopy(join(outClient, relPath), join(outCloudflare, relPath));
            }

            staticRoutes = relPaths
              .map(normalizePath)
              .map((m) => `/${m.endsWith(".html") ? m.slice(0, -5) : m}`)
              .map((m) => (m.endsWith("/index") ? m.slice(0, -5) : m));
          }

          // 5. Create _routes.json
          await writeFile(
            join(outCloudflare, ROUTES_JSON_NAME),
            JSON.stringify(
              {
                version: 1,
                include: ["/*"],
                exclude: staticRoutes,
              },
              undefined,
              2,
            ),
            "utf-8",
          );

          // 6. Create _worker.js
          const res = Object.entries(bundle).find(([_, value]) => {
            return value.type === "chunk" && value.isEntry && value.name === WORKER_NAME;
          });

          if (!res) {
            throw new Error(`Cannot find ${WORKER_NAME} entry`);
          }

          const [chunkPath] = res;

          await writeFile(
            join(outCloudflare, WORKER_JS_NAME),
            `import handler from "./server/${chunkPath}";
export default handler;
`,
            "utf-8",
          );
        },
      },
    },
  ] satisfies Plugin[];
};

async function symlinkOrCopy(target: string, path: string) {
  assert(isAbsolute(target), `[${NAME}] target should be an absolute path. Aborting`);
  assert(isAbsolute(path), `[${NAME}] path should be an absolute path. Aborting`);

  if (isWin || isCI) {
    await cp(target, path, {
      dereference: true,
      force: true,
      recursive: true,
    });
  } else {
    const parent = dirname(path);
    await mkdir(parent, { recursive: true }).catch(() => {});
    await symlink(posix.relative(parent, target), path);
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

async function prerenderPages() {
  const filePaths: string[] = [];
  await prerender({
    // biome-ignore lint/suspicious/noExplicitAny: TODO
    async onPagePrerender(page: any) {
      const result = page._prerenderResult;
      filePaths.push(result.filePath);
      await mkdir(dirname(result.filePath), { recursive: true }).catch(() => {});
      await writeFile(result.filePath, result.fileContent, "utf-8");
    },
  });
  return filePaths;
}

type VikeConfig = ReturnType<typeof getVikeConfig>;
type PrerenderSetting = VikeConfig["config"]["prerender"];
function isPrerenderEnabled(vike: VikeConfig): boolean {
  return (
    isPrerenderValueEnabling(vike.config.prerender) ||
    Object.values(vike.pages).some((page) => isPrerenderValueEnabling(page.config.prerender))
  );
}
function isPrerenderValueEnabling(prerender: PrerenderSetting): boolean {
  const val = prerender?.[0];
  if (isObject(val)) return val.enable === undefined || val.enable === true;
  return val === true;
}
function isObject(val: unknown): val is object {
  return typeof val === "object" && val !== null;
}
function assert2(condition: unknown): asserts condition {
  assert(condition, "[Bug] Reach out to a maintainer");
}
