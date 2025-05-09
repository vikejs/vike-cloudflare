/// <reference types="@photonjs/core/api" />
import type { Plugin } from "vite";
import { NAME, resolvedVirtualWorkerEntryId, virtualUserEntryId, virtualWorkerEntryId } from "./const";
import type { SupportedServers } from "../types";
import { getAsset } from "../assets";
import { assert } from "../assert";

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
          // Ensures that photonjs meta are up to date!
          await this.load({ ...resolved, resolveDependencies: true });

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
      name: `${NAME}:resolve-user-entry`,
      resolveId(id) {
        if (id === virtualUserEntryId) {
          return this.resolve(this.environment.config.photonjs.entry.index.id, undefined, { isEntry: true });
        }
      },
    },
  ];
}
