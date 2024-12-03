import { hattip } from "@hattip/vite";
import { pages } from "vike-cloudflare";
import vikeSolid from "vike-solid/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
  },
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
