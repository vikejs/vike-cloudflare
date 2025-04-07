/// <reference types="vike-server/api" />
import type { Plugin } from "vite";
import {
  NAME,
  resolvedVirtualWorkerEntryId,
  virtualDefaultEntryId,
  virtualUserEntryId,
  virtualWorkerEntryId,
} from "./const";
import type { SupportedServers } from "../types";
import { getAsset } from "../assets";
import { assert } from "../assert";
import { getVikeConfig } from "vike/plugin";

const supportedServers = ["hono", "hattip"];

export function entriesPlugin(): Plugin[] {
  return [
    {
      name: `${NAME}:resolve-entries:prod`,
      apply: "build",
      async resolveId(id) {
        if (id === virtualWorkerEntryId) {
          return resolvedVirtualWorkerEntryId;
        }
      },
      async load(id) {
        if (id === resolvedVirtualWorkerEntryId) {
          const entry = this.environment.config.photonjs.entry.index;
          const resolved = await this.resolve(this.environment.config.photonjs.entry.index.id, undefined, {
            isEntry: true,
          });
          assert(resolved);
          const loaded = await this.load({ ...resolved, resolveDependencies: true });
          console.log("LOADED", entry, loaded);

          if (entry.type === "server") {
            assert(
              supportedServers.includes(entry.server),
              `[${NAME}] Only "hono" and "hattip" are supported, found "${entry.server}"`,
            );

            return getAsset(entry.server as SupportedServers);
          }

          // TODO handle universal-middleware
          assert(false, `[${NAME}] Unsupported entry type "${entry.type}"`);
        }
      },
    },
    {
      name: `${NAME}:resolve-entries:default-server`,

      resolveId(id) {
        if (id === virtualUserEntryId) {
          return this.resolve(this.environment.config.photonjs.entry.index.id, undefined, {
            isEntry: true,
          });
        }
      },

      async config(userConfig) {
        const vikeConfig = getVikeConfig(userConfig);

        // No server provided by the user, we default to hono-dev
        if (!vikeConfig.config.server) {
          return {
            photonjs: {
              entry: {
                index: {
                  id: virtualDefaultEntryId,
                  type: "server",
                  server: "hono",
                },
              },
            },
          };
        }
      },

      async load(id) {
        if (id === virtualDefaultEntryId) {
          return getAsset("hono-dev");
        }
      },
    },
  ];
}
