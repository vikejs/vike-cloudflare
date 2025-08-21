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
        // FIXME migrate to new Photon usage
        if (id === resolvedVirtualWorkerEntryId) {
          const entry = this.environment.config.photon.server;
          const resolved = await this.resolve(this.environment.config.photon.server.id, undefined, {
            isEntry: true,
          });
          assert(resolved);
          // Ensures that photonjs meta are up to date!
          await this.load({ ...resolved, resolveDependencies: true });

          if (entry.type === "server") {
            assert(
              supportedServers.includes(entry.server as string),
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
          return this.resolve(this.environment.config.photon.server.id, undefined, { isEntry: true });
        }
      },
    },
  ];
}
