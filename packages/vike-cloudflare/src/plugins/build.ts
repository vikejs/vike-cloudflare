/// <reference types="vike-server/api" />
import { normalizePath, type Plugin, type ResolvedConfig } from "vite";
import { isCI, isWin, NAME, ROUTES_JSON_NAME, virtualWorkerEntryId, WORKER_JS_NAME } from "./const";
import { cp, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { builtinModules } from "node:module";
import { dirname, isAbsolute, join, posix } from "node:path";
// import { prerender } from "vike/api";
import { getVikeConfig } from "vike/plugin";
import { assert } from "../assert";

export function buildPlugin(): Plugin {
  let shouldPrerender = false;

  return {
    name: NAME,
    enforce: "post",
    applyToEnvironment(env) {
      return env.name === "cloudflare";
    },
    async configResolved(config) {
      const vike = getVikeConfig(config);
      assert(vike);
      shouldPrerender = isPrerenderEnabled(vike);
    },
    config() {
      // Vite bundles/inlines workspace packages by default.
      // It needs to bundle the right exports.
      return {
        esbuild: {
          ignoreAnnotations: false,
          treeShaking: true,
          minifySyntax: true,
        },
        build: {
          target: "es2022",
          rollupOptions: {
            external: [...builtinModules, /^node:/],
            treeshake: {
              preset: "smallest",
              moduleSideEffects: "no-external",
            },
          },
        },
        builder: {
          async buildApp(builder) {
            await builder.build(builder.environments.client);
            await builder.build(builder.environments.ssr);
            await builder.build(builder.environments.cloudflare);
          },
        },
      };
    },
    buildStart(this) {
      this.emitFile({
        type: "chunk",
        fileName: WORKER_JS_NAME,
        id: virtualWorkerEntryId,
      });
    },

    writeBundle: {
      order: "post",
      sequential: true,
      async handler(_opts, bundle) {
        const outCloudflare = getOutDir(this.environment.config, "cloudflare");
        const outClient = getOutDir(this.environment.config, "client");
        const outServer = getOutDir(this.environment.config, "server");

        console.log({
          outCloudflare,
          outClient,
          outServer,
        });

        // // 1. Ensure empty `dist/cloudflare` folder
        // await rm(outCloudflare, { recursive: true, force: true });
        // await mkdir(outCloudflare, { recursive: true });

        const staticRoutes: string[] = [];

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
        // await symlinkOrCopy(outServer, join(outCloudflare, "server"));

        // TODO
        // 4. Prerender
        // if (shouldPrerender) {
        //   await prerender();
        //   const vike = getVikeConfig(resolvedConfig);
        //   assert(vike.prerenderContext.output);
        //   const filePaths = vike.prerenderContext.output.map((o) => o.filePath);
        //   const relPaths = filePaths.map((path) => relative(outClient, path));
        //   for (const relPath of relPaths) {
        //     await symlinkOrCopy(join(outClient, relPath), join(outCloudflare, relPath));
        //   }
        //
        //   staticRoutes = relPaths
        //     .map(normalizePath)
        //     .map((m) => `/${m.endsWith(".html") ? m.slice(0, -5) : m}`)
        //     .map((m) => (m.endsWith("/index") ? m.slice(0, -5) : m));
        // }

        // TODO use emitFile
        // 5. Create _routes.json
        await writeFile(
          join(outCloudflare, ROUTES_JSON_NAME),
          JSON.stringify(
            {
              version: 1,
              include: ["/*"],
              exclude: ["/assets/*", ...staticRoutes],
            },
            undefined,
            2,
          ),
          "utf-8",
        );
      },
    },
  };
}

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
