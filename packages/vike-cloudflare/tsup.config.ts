import RawPlugin from "esbuild-plugin-raw";
import { defineConfig } from "tsup";

export default defineConfig({
  target: "node18",
  format: "esm",
  dts: true,
  entry: ["src/index.ts", "src/config.ts"],
  clean: true,
  esbuildPlugins: [RawPlugin()],
});
