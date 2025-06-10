import type { Plugin } from "vite";
import {
  NAME,
  resolvedVirtualProdEntryId,
  resolvedVirtualUserEntryId,
  virtualEntryAuto,
  virtualProdEntryId,
  virtualUserEntryId,
} from "./const";
import type { SupportedServers } from "../types";
import { getAsset } from "../assets";
import { getUserServerConfig } from "./utils/resolveServerConfig";
import { assert } from "../assert";

export function entriesPlugin(): Plugin[] {
  const resolvedPlugins = new Map<string, SupportedServers>();

  return [
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
          const server = getUserServerConfig(this.environment.config);

          if (server) {
            // Resolve entry graph until we find a plugin
            const loaded = await this.load({ id: server.entry.index, resolveDependencies: true });
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
          const server = getUserServerConfig(this.environment.config);

          if (server) {
            const resolved = await this.resolve(server.entry.index);
            assert(resolved, `[${NAME}] Cannot resolve ${server.entry.index}`);

            return resolved;
          }

          // Not a \0 id so that `vike-server` can resolve it
          return resolvedVirtualUserEntryId;
        }
      },
      async load(id) {
        if (id === resolvedVirtualUserEntryId) {
          const server = getUserServerConfig(this.environment.config);
          if (server) {
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
