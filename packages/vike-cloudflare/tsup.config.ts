import RawPlugin from "esbuild-plugin-raw";
import { defineConfig } from "tsup";

export default defineConfig({
  target: "node18",
  format: "esm",
  dts: true,
  entry: {
    index: "src/index.ts",
    config: "src/config.ts",
    hono: "src/hono/index.ts",
    "hono/serve": "src/hono/serve.ts",
    hattip: "src/hattip/index.ts",
    "hattip/serve": "src/hattip/serve.ts",
  },
  clean: true,
  esbuildPlugins: [RawPlugin()],
});
