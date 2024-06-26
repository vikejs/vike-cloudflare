import { hattip } from "@hattip/vite";
import { pages } from "vike-cloudflare";
import vikeSolid from "vike-solid/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    hattip(),
    vike({}),
    vikeSolid(),
    pages({
      server: {
        kind: "hattip",
        entry: "hattip-entry.ts",
      },
    }),
  ],
});
