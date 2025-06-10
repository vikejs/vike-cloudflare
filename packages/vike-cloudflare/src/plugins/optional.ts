import type { Plugin } from "vite";
import { NAME } from "./const";

export function optionalPlugin(): Plugin {
  return {
    name: `${NAME}:optional`,
    async resolveId(id, importer, options) {
      if (id.startsWith("@hattip/adapter-cloudflare-workers")) {
        const dep = await this.resolve(id, importer, options);
        if (!dep) {
          throw new Error('Please install the following missing package: "@hattip/adapter-cloudflare-workers"');
        }
      }
    },
  };
}
