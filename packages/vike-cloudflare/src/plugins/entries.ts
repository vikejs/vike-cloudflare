import type { Plugin } from "vite";
import {
  NAME,
  resolvedVirtualProdEntryId,
  resolvedVirtualUserEntryId,
  virtualEntryAuto,
  virtualProdEntryId,
  virtualUserEntryId,
} from "./const";
import type { SupportedServers, VikeCloudflarePagesOptions } from "../types";
import { getVikeConfig } from "vike/plugin";
import { getAsset } from "../assets";

export function entriesPlugin(): Plugin[] {
  const resolvedPlugins = new Map<string, SupportedServers>();
  let options: VikeCloudflarePagesOptions;

  return [
    {
      name: `${NAME}:resolve-entries:config`,
      enforce: "pre",
      configResolved: async (config) => {
        const vike = getVikeConfig(config);
        options = { server: vike.config.server };
      },
    },
    {
      name: `${NAME}:resolve-entries:pre`,
      enforce: "pre",
      apply: "build",
      async resolveId(id, importer, opts) {
        if (id in idsToServers) {
          const resolved = await this.resolve(id, importer, opts);
          if (resolved) {
            resolvedPlugins.set(resolved.id, idsToServers[id]);
          }
        }
      },
    },
    {
      name: `${NAME}:resolve-entries:prod`,
      apply: "build",
      async resolveId(id, importer, opts) {
        if (id === virtualEntryAuto || id === virtualProdEntryId) {
          return resolvedVirtualProdEntryId;
        }
      },
      async load(id) {
        if (id === resolvedVirtualProdEntryId) {
          if (options.server) {
            // Resolve entry graph until we find a plugin
            const loaded = await this.load({ id: options.server.entry, resolveDependencies: true });
            const graph = new Set([...loaded.importedIdResolutions, ...loaded.dynamicallyImportedIdResolutions]);

            let found: SupportedServers | undefined;
            for (const imported of graph.values()) {
              found = resolvedPlugins.get(imported.id);
              if (found) break;
              if (imported.external) continue;
              const sub = await this.load({ id: imported.id, resolveDependencies: true });
              for (const imp of [...sub.importedIdResolutions, ...sub.dynamicallyImportedIdResolutions]) {
                graph.add(imp);
              }
            }
            assert(found, `[${NAME}] Cannot find "vike-cloudflare/hattip" or "vike-cloudflare/hono" in server entry`);

            return getAsset(found);
          }

          // Default to hono
          return getAsset("hono");
        }
      },
    },
    {
      name: `${NAME}:resolve-entries:user`,
      async resolveId(id) {
        if (id === virtualEntryAuto || id === virtualUserEntryId || id === resolvedVirtualUserEntryId) {
          if (options.server) {
            const resolved = await this.resolve(options.server.entry);

            assert(resolved, `[${NAME}] Cannot resolve ${options.server.entry}`);

            return resolved;
          }

          // Not a \0 id so that `vike-server` can resolve it
          return resolvedVirtualUserEntryId;
        }
      },
      async load(id) {
        if (id === resolvedVirtualUserEntryId) {
          if (options.server) {
            // Should have already been resolved by resolveId hook
            assert(false);
          }
          return getAsset("hono-dev");
        }
      },
    },
  ];
}

const idsToServers: Record<string, SupportedServers> = {
  "vike-cloudflare/hono": "hono",
  "vike-server/hono": "hono",
  "vike-cloudflare/hattip": "hattip",
  "vike-server/hattip": "hattip",
};

function assert(condition: unknown, message?: string): asserts condition {
  if (condition) {
    return;
  }
  throw new Error(message);
}
